import { Component } from "react";

class Input extends Component {
  render() {
    return (
      <input
        type="text"
        placeholder="Search your location..."
        value={this.props.location}
        onChange={this.props.onChangeLocation}
      />
    );
  }
}

export default Input;
