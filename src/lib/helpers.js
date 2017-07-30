import _ from 'lodash';

export const gutterPadding = 21;
export const clamp = (n, min, max) => Math.max(Math.min(n, max), min);
export const getColumnWidth = (length) => (window.innerWidth / length) - (gutterPadding / length); // spread columns over available window width

export const calculateVisiblePositions = (newOrder, width, height) => {
    return newOrder.map((column, col) => {
       return _.range(column.length + 1).map((item, row) => {
           return [width * col, height * row];
       });
   });
}

// define spring motion opts
export const springSetting1 = {stiffness: 180, damping: 10};
export const springSetting2 = {stiffness: 150, damping: 16};
