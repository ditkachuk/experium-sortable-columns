import React, { Component } from 'react';
import { Motion, spring } from 'react-motion';
import keys from 'lodash/keys';

import {
    clamp,
    toColumns,
    calculateVisiblePositions,
    reinsert,
    springSetting
} from './helpers';

export default class Columns extends Component {
    // static propTypes = {
    //     initialList: [],
    //     columns: 2,
    //     fixed: false,
    //     itemTemplate: () => {},
    //     onChange: () => {}
    // }

    constructor(props) {
        super(props);
        const { initialList, columns : columnsCount } = props;

        this.data = initialList;
        const data = keys(initialList);
        const columns = toColumns(data, columnsCount);

        this.state = {
            mouse: [0, 0],
            delta: [0, 0],
            lastPress: null,
            currentColumn: null,
            isPressed: false,
            isResizing: false,

            columns,
        };
    }

    componentWillMount() {
        this.resizeTimeout = null;
        this.layout = calculateVisiblePositions(
            this.state.columns,
            this.props.width,
            this.props.height
        );
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

    handleMouseMove = ({pageX, pageY}) => {
        const { width, height, fixed, columns : columnsNumber } = this.props;
        const { columns, lastPress, currentColumn: colFrom, isPressed, delta: [dx, dy] } = this.state;
        var newColumns = columns;

        if (isPressed) {
            const mouse = [pageX - dx, pageY - dy];
            const colTo = clamp(Math.floor((mouse[0] + (width / 2)) / width), 0, 2);
            const rowTo = clamp(Math.floor((mouse[1] + (height / 2)) / height), 0, 100);
            const rowFrom = columns[colFrom].indexOf(lastPress);

            if (columns[colTo]) {
                console.log(colFrom, rowFrom, colTo, rowTo);
                newColumns = reinsert(
                    columns,
                    colFrom, rowFrom, colTo, rowTo,
                    columnsNumber, fixed
                );
            }

            this.layout = calculateVisiblePositions(newColumns, width, height);

            this.setState({
                mouse,
                columns: newColumns,
                currentColumn: columns[colTo] ? colTo : colFrom
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
        this.props.onChange(this.state.columns);

        this.setState({
            isPressed: false,
            delta: [0, 0]
        });
    }

    render() {
        const { columns, lastPress, currentColumn, isPressed, mouse, isResizing } = this.state;
        const { width, height, itemTemplate } = this.props;
        const { data, layout } = this;

        const maxHeight = height * columns.reduce((max, { length }) => length > max ? length : max, 0);

        return (
            <div className="items" ref={node => this.items = node} style={{ height: maxHeight }}>
                { columns.map( (column, colIndex) =>
                    column.map( (row) => {
                        let style,
                            x,
                            y,
                            visualPosition = columns[colIndex].indexOf(row),
                            isActive = (row === lastPress && colIndex === currentColumn && isPressed);

                        if (isActive) {
                            [x, y] = mouse;
                            style = {
                                translateX: x,
                                translateY: y
                            };
                        } else if(isResizing) {
                            [x, y] = layout[colIndex][visualPosition];
                            style = {
                                translateX: x,
                                translateY: y
                            };
                        } else {
                            [x, y] = layout[colIndex][visualPosition];
                            style = {
                                translateX: spring(x, springSetting),
                                translateY: spring(y, springSetting)
                            };
                        }

                        return (
                            <Motion key={row} style={style}>
                                {({ translateX, translateY }) => (
                                    <div
                                        onMouseDown={this.handleMouseDown.bind(null, row, colIndex, [x, y])}
                                        onTouchStart={this.handleTouchStart.bind(null, row, colIndex, [x, y])}
                                        className={isActive ? 'item is-active' : 'item'}
                                        style={{
                                            width,
                                            height,
                                            WebkitTransform: `translate3d(${translateX}px, ${translateY}px, 0))`,
                                            transform: `translate3d(${translateX}px, ${translateY}px, 0)`,
                                            zIndex: (row === lastPress && colIndex === currentColumn) ? 99 : visualPosition,
                                        }}
                                    >
                                        { itemTemplate(data[row], row) }
                                    </div>
                                )}
                            </Motion>
                        );
                    })
                )}
            </div>
        )
    }
}
