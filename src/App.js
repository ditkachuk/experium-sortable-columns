import React, { Component } from 'react';

import './example.css';
import List from './lib/List.js';

const data = [
  { id: 1, name: 'item 1'},
  { id: 2, name: 'item 2'},
  { id: 3, name: 'item 3'},
  { id: 4, name: 'item 4'},
  { id: 5, name: 'item 5'},
  { id: 6, name: 'item 6'},
];

class App extends Component {
    render() {
        return (
            <List
              data={data}
              columns={2}
              item={(item, index) => <span>{item.name} {index}</span> }
              onChange={console.log}
            />
        );
    }
}

export default App;
