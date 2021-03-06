import React, {Component} from 'react';
import MessageList from './MessageList.jsx';
import ChatBar from './ChatBar.jsx';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      userCounter: "",
      colourScheme: ""
    };
    this.composeNewMessage = this.composeNewMessage.bind(this);
    this.changeUsername = this.changeUsername.bind(this);
  }

  componentDidMount() {
    this.socket = new WebSocket("ws://localhost:4000");
    console.log("Connected to Server: ", this.socket);

    this.socket.onmessage = (event) => {
      const receivedMessage = JSON.parse(event.data);
      switch(receivedMessage.type) {
        case "incomingMessage":
          this.setState({
            messages: this.state.messages.concat({
              type: receivedMessage.type,
              id: receivedMessage.id,
              colourScheme: receivedMessage.colourScheme,
              username: receivedMessage.username,
              content: receivedMessage.content
            })
          });
          break;

        case "incomingNotification":
          this.setState({
            messages: this.state.messages.concat({
              type: receivedMessage.type,
              content: receivedMessage.content
            })
          });
          break;

        case "userCounter":
          this.setState({
            userCounter: receivedMessage.content
          });
          break;

        case "colourScheme":
          this.setState({
            colourScheme: receivedMessage.content
          });
          break;

        default:
          throw new Error("Unknown event type " + receivedMessage.type);
      }
    }
  }

  composeNewMessage = message => {
    this.socket.send(JSON.stringify({
      type: "postMessage",
      colourScheme: this.state.colourScheme,
      username: message.username,
      content: message.content
    }));
  }

  changeUsername = notification => {
    this.socket.send(JSON.stringify({
      type: "postNotification",
      content: notification
    }));
  }

  render() {
    return (
      <div>
        <nav>
          <h1>Chatty</h1>
          <h5>{this.state.userCounter} users online</h5>
        </nav>
        <MessageList messages={this.state.messages} notification={this.state.notification} />
        <ChatBar composeNewMessage={this.composeNewMessage} changeUsername={this.changeUsername} />
      </div>
    );
  }
}

export default App;
