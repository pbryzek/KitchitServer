# KitchitServer
The server side component to the Kitchit Demo

How to get the demo up and running:
1) Ensure you have both repos cloned locally:
Server:
https://github.com/pbryzek/KitchitServer.git
Client:
https://github.com/pbryzek/KitchitClient.git

The server is written in nodejs with a Postgres backend.  The Client is written in react native.

2) Ensure you have postgres installed locally, you may need to modify the credentials in :
KitchitServer/constants/constants_pg.js

From command line you should be able to launch postgres terminal via:
psql -h localhost -U [user] kitchit

3) Import the database dump file:

psql kitchit < KitchitServer/psql/kitchit.dump

4) Launch the server. In KitchitServer directory run
node server.js

5) Open the iOS app KitchitClient/ios/Kitchit.xcodeproj and run the client on the XCode simulator.
