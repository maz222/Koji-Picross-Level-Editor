import React from 'react';
import styled, { keyframes } from 'styled-components';
import Koji from '@withkoji/vcc';
import CustomVCC from '@withkoji/custom-vcc-sdk';
import {GridBar,CellBar} from './TopBar.js';

const DEFAULT_ROWS = 3;
const DEFAULT_COLS = 3;

let EmptyCell = styled.div`
	background-color:rgb(240,240,240);
    width:100%;
    height:100%;
	&:hover {
		background-color:rgb(60,60,60)
	}
`;

let FilledCell = styled.div`
	background-color:rgb(20,20,20);
    width:100%;
    height:100%;
    &:hover {
		background-color:rgb(210,210,210)
	}
`;

let SectionTag = styled.h2`
	background-color:rgb(255,255,255);
    width:1em;
    height:1em;
	padding:4px;
    display:flex;
    justify-content:center;
    align-items:center;
    margin:0;
    font-size:.75em;
`;

class App extends React.Component {
    constructor(props) {
        super(props);
        this.customVCC = new CustomVCC();
        let level = [];
        for(var i=0;i<DEFAULT_ROWS;i++) {
            level.push([]);
            for(var j=0;j<DEFAULT_COLS;j++) {
                level[i].push(false);                
            }
        }
        this.state = {
            level:level
        };
    }

    componentDidMount() {
        this.customVCC.register('300','300');
        this.customVCC.onUpdate((newProps) => {
            if(newProps.value != "" && newProps.value != undefined) {
                this.setState({level:newProps.value});
            }
        })
    }

    expandX() {
        let level = this.state.level;
        for(var i=0; i<level.length; i++) {
            level[i].push(false);
        }
        this.state = {level:level};
        this.forceUpdate();
        this.customVCC.change(this.state.level);
        this.customVCC.save();
    }

    shrinkX() {
        let level = this.state.level;
        //min level size of 1x1
        if(level[0].length == 1) {
            return;
        }
        for(var i=0;i<level.length;i++) {
            level[i].pop();
        }
        this.state = {level:level};
        this.forceUpdate();
        this.customVCC.change(this.state.level);
        this.customVCC.save();
    }

    expandY() {
        let level = this.state.level;
        let t = [];
        for(var i=0;i<level[0].length;i++) {
            t.push(false);
        }
        level.push(t);
        this.state = {level:level};
        this.forceUpdate();
        this.customVCC.change(this.state.level);
        this.customVCC.save();
    }

    shrinkY() {
        let level = this.state.level;
        //min level size of 1x1
        if(level.length == 1) {
            return;
        }
        level.pop();
        this.state = {level:level};
        this.forceUpdate();
        this.customVCC.change(this.state.level);
        this.customVCC.save();
    }

    toggleCell(row,col) {
        console.log("toggle");
        console.log([row,col]);
        this.state.level[row][col] = !this.state.level[row][col];
        this.forceUpdate();
        this.customVCC.change(this.state.level);
        this.customVCC.save();
    }

    parseSection(cellList) {
    	let counts = [];
    	let cellCount = 0;
    	for(var c in cellList) {
    		if(cellList[c]) {
    			cellCount += 1;
    		}
    		else {
    			if(cellCount > 0) {
    				counts.push(cellCount);
    				cellCount = 0;
    			}
    		}
    	}
    	if(cellCount > 0) {
    		counts.push(cellCount);
    	}
    	return counts.length > 0 ? counts : [0];
    }

    getColumn(matrix,columnIndex) {
    	return matrix.map(x => x[columnIndex]);
    }

    getMaxLabels() {
    	let maxRows = 0;
        let maxCols = 0;
    	for(var i=0;i<this.state.level.length;i++) {
    		maxRows=Math.max(this.parseSection(this.state.level[i]).length,maxRows);
    		maxCols=Math.max(this.parseSection(this.getColumn(this.state.level,i)).length,maxCols);
    	}
    	return [maxRows,maxCols];
    }

    renderGrid() {
        let sizes = this.getMaxLabels();
        let maxColHeight = sizes[1];
        let maxRowWidth = sizes[0];

        let gridSize = Math.max(sizes[0]+this.state.level[0].length,sizes[1]+this.state.level.length);
        gridSize = gridSize%2==0 ? gridSize: gridSize+1;

        let xOffset = (gridSize-maxRowWidth-this.state.level[0].length)/2;
        console.log([gridSize,maxRowWidth]);
        console.log(xOffset);
        return(this.state.level.map((row,rowIndex) => {
            let tags = this.parseSection(this.state.level[this.state.level.length-rowIndex-1]).reverse();
            return(
                //row tags
                tags.map((tag,tagIndex) => {
                    let colStart = maxRowWidth-tagIndex-1;
                    let rowStart = maxColHeight+this.state.level.length-rowIndex-1;
                    let gridStyle = {
                        gridColumnStart:colStart,
                        gridColumnEnd:colStart+1,
                        gridRowStart:rowStart,
                        gridRowEnd:rowStart+1
                    };
                    return(<SectionTag style={gridStyle}>{tag}</SectionTag>);
                }).concat(
                    //grid
                    row.map((isCellFilled,cellIndex) => {
                        let colStart = maxRowWidth+cellIndex;
                        let rowStart = maxColHeight+rowIndex;
                        let gridStyle = {
                            gridColumnStart:colStart,
                            gridColumnEnd:colStart+1,
                            gridRowStart:rowStart,
                            gridRowEnd:rowStart+1
                        };
                        return(isCellFilled ? <FilledCell style={gridStyle} onClick={() => {this.toggleCell(rowIndex,cellIndex)}} /> : 
                            <EmptyCell style={gridStyle} onClick={() => {this.toggleCell(rowIndex,cellIndex)}} />)
                    })
                )
            );
        }).concat(
            //column tags
            this.state.level[0].map((val,colIndex) => {
                let tags = this.parseSection(this.getColumn(this.state.level,colIndex)).reverse();
                return(
                    tags.map((tag,tagIndex) => {
                        let colStart = maxRowWidth+colIndex;
                        let rowStart = maxColHeight-tagIndex-1;
                        let gridStyle = {
                            gridColumnStart:colStart,
                            gridColumnEnd:colStart+1,
                            gridRowStart:rowStart,
                            gridRowEnd:rowStart+1
                        };
                        return(<SectionTag style={gridStyle}>{tag}</SectionTag>);
                    })
                );
            })
        ));
    }    

    render() {
        let PageDiv = styled.div`
            padding:50px;
            width:calc(100% - 100px);
            height:calc(100% - 100px);
            display:flex;
            align-items:center;
            justify-content:center;
            flex-direction:column;
            background-color:rgb(80,80,80);
        `;

		let gridSizes = this.getMaxLabels();
        let gridSize = Math.max(gridSizes[0]+this.state.level[0].length,gridSizes[1]+this.state.level.length);
        gridSize = gridSize%2==0 ? gridSize: gridSize+1;
		let Grid = styled.div`
			display:grid;
			margin:10px;
			grid-template-columns:repeat(${gridSize-1}, 1fr);
			grid-template-rows:repeat(${gridSize-1}, 1fr);
		`;
        console.log("---");
        console.log(this.state.level);
        return (
            <PageDiv>
                <GridBar expandY={() => {this.expandY()}} expandX={() => {this.expandX()}} shrinkX={() => {this.shrinkX()}} shrinkY={() => {this.shrinkY()}}/>
                <Grid>
                {this.renderGrid()}
                </Grid>
            </PageDiv>
        );
    }
}

export default App;