cmake_minimum_required(VERSION 3.7)
project(SimConnectServer)

set(CMAKE_CXX_STANDARD 17)
set(OPENSSL_USE_STATIC_LIBS TRUE)

include_directories(
        ${CMAKE_SOURCE_DIR}/include
)

link_directories(
        ${CMAKE_SOURCE_DIR}/lib
        "C:/Program Files/OpenSSL-Win64/lib/VC/x64/MDd"

)
set(SOURCE_FILES
        src/main.cpp
        # Add other source files here
)

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_SOURCE_DIR}/bin)



if(CMAKE_CXX_COMPILER_ID MATCHES "GNU|Clang")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -Wextra -pedantic-errors")
    set(CMAKE_CXX_FLAGS_DEBUG "-g")
    set(CMAKE_CXX_FLAGS_RELEASE "-O2")
    add_compile_options(-Wa,-mbig-obj) # Enable big object format
elseif(CMAKE_CXX_COMPILER_ID MATCHES "MSVC")
    # Visual Studio specific settings
    add_compile_options(/W4 /permissive- /std:c++17)
endif()

if(CMAKE_BUILD_TYPE MATCHES Debug)
    add_compile_options(-g0) # Reduce debug information
endif()



add_executable(SimConnectServer ${SOURCE_FILES})
target_link_libraries(SimConnectServer SimConnect ws2_32 wsock32 libssl libcrypto)

