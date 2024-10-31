# RSSchool NodeJS websocket task template
> Static http server and base task packages. 
> By default WebSocket client tries to connect to the 3000 port.

**You should be in [develop branch](https://github.com/wellder00/Websocket_battleship_server/tree/develop).**

## How to install battleship server
1. Clone/download repo
```bash
git clone https://github.com/KuzmakD/battleship.git
```
2. `npm install`

## How to run
**Development**

`npm run start:dev`

* App served @ `http://localhost:8081` with nodemon

**Production**

`npm run start`

* App served @ `http://localhost:8081` without nodemon

---

**All commands**

Command | Description
--- | ---
`npm run start:dev` | App served @ `http://localhost:8181` with nodemon
`npm run start` | App served @ `http://localhost:8181` without nodemon

**Note**: replace `npm` with `yarn` in `package.json` if you use yarn.
