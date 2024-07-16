// websocket server for fs2020 data streaming to web clients using simconnect api
#include <websocketpp/config/asio_no_tls.hpp>
#include <websocketpp/server.hpp>
#include <iostream>
#include <set>
#include <thread>
#include <nlohmann/json.hpp>

#include "SimConnect.h"

using json = nlohmann::json;
using websocket_server = websocketpp::server<websocketpp::config::asio>;
using websocket_connection = websocket_server::connection_ptr;

struct AircraftData {
    double latitude;
    double longitude;
    double airspeed;
    int altitude;
    float pitch;
    float roll;
};

static DWORD DATA_REQUEST_ID = 1;
websocket_server ws_server;

std::set<websocket_connection> connections;

void sendAircraftData(const AircraftData* pData) {
    json j;
    j["Latitude"] = pData->latitude;
    j["Longitude"] = pData->longitude;
    j["Airspeed"] = pData->airspeed;
    j["Altitude"] = pData->altitude;
    j["Pitch"] = pData->pitch * (-180.0 / M_PI);
    j["Roll"] = pData->roll * (-180.0 / M_PI);

    std::string message = j.dump();

    try {
        for (auto it : connections) {
            ws_server.send(it, message, websocketpp::frame::opcode::text);
        }
        //std::cout << "Sent data to WebSocket clients: " << message << std::endl;
    } catch (const std::exception& e) {
        std::cerr << "Failed to send data over WebSocket: " << e.what() << std::endl;
    }
}

void onOpen(websocketpp::connection_hdl hdl) {
    websocket_connection con = ws_server.get_con_from_hdl(hdl);
    connections.insert(con);
    std::cout << "New connection established" << std::endl;
}

void onClose(websocketpp::connection_hdl hdl) {
    websocket_connection con = ws_server.get_con_from_hdl(hdl);
    connections.erase(con);
    std::cout << "Connection closed" << std::endl;
}

void CALLBACK MyDispatchProc(SIMCONNECT_RECV* pData, DWORD cbData, void* pContext) {
    if (pData->dwID == SIMCONNECT_RECV_ID_SIMOBJECT_DATA) {
        SIMCONNECT_RECV_SIMOBJECT_DATA* pObjData = (SIMCONNECT_RECV_SIMOBJECT_DATA*)pData;
        if (pObjData->dwRequestID == DATA_REQUEST_ID) {
            AircraftData* pAircraftData = (AircraftData*)&pObjData->dwData;
            sendAircraftData(pAircraftData);
        }
    }
}

int main() {
    try {
        HANDLE hSimConnect = NULL;
        HRESULT hr = SimConnect_Open(&hSimConnect, "My Client", NULL, 0, 0, 0);

        if (FAILED(hr)) {
            std::cerr << "Failed to connect to SimConnect!" << std::endl;
            return 1;
        }

        std::cout << "Connected to Flight Simulator 2020!" << std::endl;

    
        DWORD dwDataDefinitionId = 1;

        SimConnect_AddToDataDefinition(hSimConnect, dwDataDefinitionId, "PLANE LATITUDE", "degrees latitude", SIMCONNECT_DATATYPE_FLOAT64);
        SimConnect_AddToDataDefinition(hSimConnect, dwDataDefinitionId, "PLANE LONGITUDE", "degrees longitude", SIMCONNECT_DATATYPE_FLOAT64);
        SimConnect_AddToDataDefinition(hSimConnect, dwDataDefinitionId, "AIRSPEED INDICATED", "knots", SIMCONNECT_DATATYPE_FLOAT64);
        SimConnect_AddToDataDefinition(hSimConnect, dwDataDefinitionId, "PLANE ALTITUDE", "feet", SIMCONNECT_DATATYPE_INT32);
        SimConnect_AddToDataDefinition(hSimConnect, dwDataDefinitionId, "PLANE PITCH DEGREES", "radians", SIMCONNECT_DATATYPE_FLOAT32);
        SimConnect_AddToDataDefinition(hSimConnect, dwDataDefinitionId, "PLANE BANK DEGREES", "radians", SIMCONNECT_DATATYPE_FLOAT32);

    
        SimConnect_RequestDataOnSimObject(hSimConnect, DATA_REQUEST_ID, dwDataDefinitionId, SIMCONNECT_OBJECT_ID_USER, SIMCONNECT_PERIOD_SIM_FRAME, 0, 0, 0);

        ws_server.clear_access_channels(websocketpp::log::alevel::all);
        ws_server.init_asio();
        ws_server.set_reuse_addr(true);
        ws_server.set_open_handler(websocketpp::lib::bind(&onOpen, websocketpp::lib::placeholders::_1));
        ws_server.set_close_handler(websocketpp::lib::bind(&onClose, websocketpp::lib::placeholders::_1));
        ws_server.listen(8080);
        ws_server.start_accept();

    
        while (SIMCONNECT_STATE::SIMCONNECT_STATE_ON) {
            SimConnect_CallDispatch(hSimConnect, MyDispatchProc, nullptr);
            ws_server.poll();
            std::this_thread::sleep_for(std::chrono::milliseconds(20));
        }

        SimConnect_Close(hSimConnect);

    } catch (const std::exception& e) {
        std::cerr << "Main error: " << e.what() << std::endl;
    }

    return 0;
}
