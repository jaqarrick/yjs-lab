# Yjs Demo

This demo allows multiple clients to draw on a shared canvas.

To try it out clone the enclosing repo, navigate into the `/demo` directory, and install the dependencies.

```
git clone https://github.com/jaqarrick/yjs-lab

cd demo
npm i
```

Then boot up the `y-websocket` server and the parcel web server using `npm start`.

---

##### How it works:

The shared Yjs doc is initialized:

```
const doc = new Y.Doc()
```

The points drawn onto a canvas, as well as the id of each client is stored in a Y.array, which lives on the shared doc.

```
window.pointData = doc.getArray()
```

The doc is shared over websockets using `y-websockets`.

```
const wsProvider = new WebsocketProvider(
	`ws://${window.location.hostname}:1234`,
	"my-roomname",
	doc
)
```

Each frame fetches the most recent `pointsData` from the doc.

```
const render = () => {
	requestAnimationFrame(render)
	drawAllPoints(pointData)
}
requestAnimationFrame(render)
```

```
const drawAllPoints = pointData => {
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	pointData.forEach(point => {
		const { x, y, color } = point
		drawPoint(x, y, color)
	})
}
```
