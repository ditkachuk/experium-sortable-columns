import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as ReactMotion from 'react-motion';
import { chunk, clamp, map } from 'lodash';

import {
    getColumnWidth,
    calculateVisiblePositions,
    springSetting1,
    springSetting2
} from './helpers';

const height = 110;

export default class List extends Component {
    // static propTypes = {
    //     data: [],
    //     columns: 2,
    //     item: () => {},
    //     onChange: () => {}
    // }

    constructor(props) {
        super(props);
        const { data, columns } = props;

        const list = map(data, (item, index) => ({ index, ...item }));
        const lists = chunk(list, Number(list.length /columns));
        const width = getColumnWidth(columns);
        console.log(list, lists, data);
        this.state = {
            mouse: [0, 0],
            delta: [0, 0],
            lastPress: null,
            currentColumn: null,
            isPressed: false,
            isResizing: false,

            lists,
        };

        this.layout = calculateVisiblePositions(lists, width, height);
        this.width = width;
        this.height = height;
    }

    componentWillMount() {
        this.resizeTimeout = null;
        this.layout = calculateVisiblePositions(this.state.lists, this.width, this.height);
    }

    componentDidMount() {
        window.addEventListener('touchmove', this.handleTouchMove);
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('touchend', this.handleMouseUp);
        window.addEventListener('mouseup', this.handleMouseUp);
    }

    componentWillUnmount() {
        window.removeEventListener('touchmove', this.handleResize);
        window.removeEventListener('mousemove', this.handleResize);
        window.removeEventListener('touchend', this.handleResize);
        window.removeEventListener('mouseup', this.handleResize);
    }

    handleTouchStart = (key, currentColumn, pressLocation, e) => {
        this.handleMouseDown(key, currentColumn, pressLocation, e.touches[0]);
    }

    handleTouchMove = (e) => {
        e.preventDefault();
        this.handleMouseMove(e.touches[0]);
    }

    reinsert = (array, colFrom, rowFrom, colTo, rowTo) => {
        var _array = array.slice(0);
        const val = _array[colFrom][rowFrom];
        _array[colFrom].splice(rowFrom, 1);
        _array[colTo].splice(rowTo, 0, val);

        if (colTo != colFrom) {
            const ordered = _array.reduce((array, value) => {
                return array.concat(value);
            });
            
            var columnCount = parseInt(ordered.length / 2);
            for (var i = 0; i < _array.length; i++) {
                _array[i] = ordered.slice(i * columnCount, columnCount * i + columnCount);
            }
        }

        return _array;
    }

    handleMouseMove = ({pageX, pageY}) => {
        const { width, height } = this;
        const { lists, lastPress, currentColumn: colFrom, isPressed, delta: [dx, dy] } = this.state;
        
        if (isPressed) {
            const mouse = [pageX - dx, pageY - dy];
            const colTo = clamp(Math.floor((mouse[0] + (width / 2)) / width), 0, 2);
            const rowTo = clamp(Math.floor((mouse[1] + (height / 2)) / height), 0, 100);
            const rowFrom = lists[colFrom].indexOf(lastPress);
            const newLists = this.reinsert(lists, colFrom, rowFrom, colTo, rowTo);
            this.layout = calculateVisiblePositions(newLists, this.width, this.height);

            this.setState({
                mouse,
                lists: newLists,
                currentColumn: colTo
            });
        }
    }

    handleMouseDown = (key, currentColumn, [pressX, pressY], {pageX, pageY}) => {
        this.setState({
            lastPress: key,
            currentColumn,
            isPressed: true,
            delta: [pageX - pressX, pageY - pressY],
            mouse: [pressX, pressY],
        });
    }

    handleMouseUp = () => {
        this.setState({
            isPressed: false,
            delta: [0, 0]
        });
    }

    render() {
        const { lists, lastPress, currentColumn, isPressed, mouse, isResizing } = this.state;
        console.log(lists);
        return (
            <div className="items">
                {lists.map( (column, colIndex) => {
                    return (
                        column.map( (row) => {
                            const index = row && row.index;
                            let style,
                                x,
                                y,
                                visualPosition = lists[colIndex].indexOf(row),
                                isActive = (index === lastPress && colIndex === currentColumn && isPressed);

                            if(isActive) {
                                [x, y] = mouse;
                                style = {
                                    translateX: x,
                                    translateY: y,
                                    scale: ReactMotion.spring(1.1, springSetting1)
                                };
                            } else if(isResizing) {
                                [x, y] = this.layout[colIndex][visualPosition];
                                style = {
                                    translateX: x,
                                    translateY: y,
                                    scale: 1
                                };
                            } else {
                                [x, y] = this.layout[colIndex][visualPosition];
                                style = {
                                    translateX: ReactMotion.spring(x, springSetting2),
                                    translateY: ReactMotion.spring(y, springSetting2),
                                    scale: ReactMotion.spring(1, springSetting1)
                                };
                            }

                            return (
                                <ReactMotion.Motion key={index} style={style}>
                                    {({translateX, translateY, scale}) =>
                                    <div
                                        onMouseDown={this.handleMouseDown.bind(null, index, colIndex, [x, y])}
                                        onTouchStart={this.handleTouchStart.bind(null, index, colIndex, [x, y])}
                                        className={isActive ? 'item is-active' : 'item'}
                                        style={{
                                            WebkitTransform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
                                            transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
                                            zIndex: (index === lastPress && colIndex === currentColumn) ? 99 : visualPosition,
                                        }}>
                                        { row && this.props.item(row, index)}
                                    </div>
                                    }
                                </ReactMotion.Motion>
                            )
                        })
                    )
                })}
            </div>
        )
    }
}
