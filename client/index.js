Vue.use(VueNativeSock.default, "ws://localhost:9090", {
	format: "json",
	reconnection: true,
	reconnectionAttempts: 5,
	reconnectionDelay: 3000
})

var messages = [
	{
		username: "nii236",
		timestamp: "5 minutes ago",
		message: "Chat has started",
		isAlert: true
	}
]

const vm = new Vue({
	el: "#ws",
	created: function() {
		this.$options.sockets.onmessage = msg => {
			const resp = JSON.parse(msg.data)
			const messages = chatApp.messages
			messages.push(resp)
		}
	}
})

const ChatBox = Vue.component("chat-box", {
	props: ["meta", "messages"],
	mounted: function() {
		console.log("Mounted chatbox")
		console.log(this.$props)
	},

	template: `
    <div id="ChatBox">
        <div class="col-md-9 ChatBox__Left">
			<div class="ChatBox__List">
				<chat-message v-for="message in messages" :data="message">
				</chat-message>
            </div>

            <div class="ChatBox__Input">
				<chat-input></chat-input>
            </div>
        </div>

        <div class="col-md-3 ChatBox__Right">
            <h3>Online Users</h3>

            <ul class="ChatBox__OnlineUsers">
				<li v-for="user in meta.onlineUsers">
                    {{ user }}
                </li>
            </ul>
        </div>
    </div>
`
})

const ChatMessage = Vue.component("chat-message", {
	props: ["data"],
	template: `
<div class="Message">
	<div class="Message--Alert" v-if="data.isAlert">
		<strong>{{ data.message }}</strong>
	</div>
	<div class="Message--Message" v-else>
		<p class="Message__Author">
			<strong>{{ data.username }}</strong>: {{ data.message }}
		</p>
	</div>
</div>`
})

var msg = ""

const ChatInputInitialState = function() {
	return { message: { text: "" } }
}

const ChatInput = Vue.component("chat-input", {
	data: function() {
		return ChatInputInitialState()
	},

	methods: {
		handleSubmit() {
			console.log(this.$data.message.text)
			const payload = {
				username: "clientperson",
				timestamp: "5 minutes ago",
				message: this.$data.message.text,
				isAlert: false
			}
			this.$socket.sendObj(payload)
			Object.assign(this.$data, ChatInputInitialState())
		}
	},
	template: `
<form @submit.prevent="handleSubmit">
	<input v-model="message.text" type="text"  placeholder="Enter your message here">
</form>`
})

const chatApp = new Vue({
	el: "#chat",
	data: {
		meta: {
			onlineUsers: ["nii236"]
		},
		messages: [
			{
				username: "nii236",
				timestamp: "5 minutes ago",
				message: "Chat has started",
				isAlert: true
			},
			{
				username: "nii236",
				timestamp: "2 minutes ago",
				message: "Hi there!",
				isAlert: false
			}
		]
	}
})
