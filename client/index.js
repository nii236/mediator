Vue.use(VueNativeSock.default, "ws://localhost:9090", {
	format: "json",
	reconnection: true,
	reconnectionAttempts: 5,
	reconnectionDelay: 3000
})

var vm = new Vue({
	el: "#ws",
	created: function() {
		this.$options.sockets.onmessage = msg => {
			const list = app7.groceryList
			const item = {
				id: list.length,
				text: msg.data
			}
			app7.groceryList.push(item)
		}
	},
	methods: {
		test: function(val) {
			this.$socket.sendObj({ awesome: "data" })
		}
	}
})

// this.$options.sockets.onmessage = data => console.log(data)

var app = new Vue({
	el: "#app",
	data: {
		message: "Hello Vue!"
	}
})

Vue.component("todo-item", {
	props: ["todo"],
	template: "<li>{{ todo.text }}</li>"
})

var app7 = new Vue({
	el: "#app-7",
	data: {
		groceryList: [
			{ id: 0, text: "Vegetables" },
			{ id: 1, text: "Cheese" },
			{ id: 2, text: "Whatever else humans are supposed to eat" }
		]
	}
})
