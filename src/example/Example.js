import React, { Component } from 'react';

import './example.css';
import '../lib/style.css';
import Columns from '../lib/Columns.js';

const data = [
    { id: 1, name: 'item 1'},
    { id: 2, name: 'item 2'},
    { id: 3, name: 'item 3'},
    { id: 4, name: 'item 4'},
    { id: 5, name: 'item 5'},
    { id: 6, name: 'item 6'},
];

export default class Example extends Component {
    state = {
        data
    }

    updateState = (newOrder) => {
        console.log(newOrder);
        //this.setState({ data: newOrder });
    }

    render() {
        const { data } = this.state;

        return (
            <div className="modal">
                <Columns
                    initialList={data}
                    columns={2}
                    fixed={true}
                    width={150}
                    height={30}
                    itemTemplate={(item, index) => (
                        <span>
                            <input type="checkbox" defaultChecked={item.id === 1} value={item.id} />
                            {item.name} {index}
                        </span>
                    )}
                    onChange={this.updateState}
                />
            </div>
        );
    }
}
