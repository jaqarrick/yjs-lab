import * as Y from "yjs"
import { WebsocketProvider } from "y-websocket"
import { v4 as uuidv4 } from "uuid"

// CLIENT INFO
const CLIENT_ID = localStorage.getItem("clientId") || uuidv4()
if (!localStorage.getItem("clientId")) {
	localStorage.setItem("clientId", CLIENT_ID)
}

const generateColor = () =>
	`rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`

const COLOR = localStorage.getItem("color") || generateColor()
if (!localStorage.getItem("color")) {
	localStorage.setItem("color", COLOR)
}

// YJS
const doc = new Y.Doc()
const wsProvider = new WebsocketProvider(
	`ws://${window.location.hostname}:1234`,
	"my-roomname",
	doc
)

wsProvider.on("status", event => {
	console.log(event.status) // logs "connected" or "disconnected"
})

window.pointData = doc.getArray()

const canvas = document.querySelector("canvas")
const ctx = canvas.getContext("2d")

const drawPoint = (x = 0, y = 0, color = "black") => {
	ctx.fillStyle = color
	ctx.fillRect(x, y, 10, 10)
}

const drawAllPoints = pointData => {
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	pointData.forEach(point => {
		const { x, y, color } = point
		drawPoint(x, y, color)
	})
}

let isMouseDown = false
canvas.addEventListener("mousedown", () => (isMouseDown = true))
canvas.addEventListener("mouseup", () => (isMouseDown = false))
canvas.addEventListener("mousemove", e => {
	if (!isMouseDown) {
		return
	}
	const x = e.offsetX
	const y = e.offsetY
	pointData.push([{ x, y, color: COLOR, clientId: CLIENT_ID }])
})

// Clear canvas
const clearPointsFromClient = (clientId = undefined) => {
	doc.transact(() => {
		for (let i = pointData.length - 1; i >= 0; i--) {
			const point = pointData.get(i)
			if (!point) {
				return
			}
			if (!clientId || point.clientId === clientId) {
				pointData.delete(i, 1)
			}
		}
	})
}

const clearCanvasBtn = document.querySelector("#clear")
clearCanvasBtn.onclick = () => clearPointsFromClient(CLIENT_ID)

const clearAllCanvasBtn = document.querySelector("#clearAll")
clearAllCanvasBtn.onclick = () => clearPointsFromClient()

// Animate
const render = () => {
	console.log(pointData.length)
	requestAnimationFrame(render)
	drawAllPoints(pointData)
}
requestAnimationFrame(render)
