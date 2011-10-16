
var canvas = null;
var ctx = null;
var boxes = null;
var hr = 3;
var vt = 3;
var horizontalLines;
var verticalLines;
var startX = 100;
var startY = 100;
var boxWidth = 100;
var turn = "HUMAN";
var humanScore = 0;
var machineScore = 0;
var lowestCost = 999;
var lineToCheck = null;

window.addEventListener("load",function() {
	canvas = document.getElementById("game-stage");
	ctx = canvas.getContext("2d");
	canvas.addEventListener("click",executeMouseClick,false);
	canvas.addEventListener("mousemove",executeMouseover,false);
	buildStage();
},false);

function executeMouseover(ev){

var x, y;
	if (ev.layerX || ev.layerX == 0)
	{ // Firefox
		x = ev.layerX;
		y = ev.layerY;
	}
	else if (ev.offsetX || ev.offsetX == 0)
	{ // Opera
		x = ev.offsetX;
		y = ev.offsetY;
	}
	document.getElementById("pos").innerHTML = "Mouse over: "+x+","+y;
	for(idx = 0;idx<horizontalLines.length;idx++)
	{
		dx = horizontalLines[idx].xPos;
		dy = horizontalLines[idx].yPos;
		if((x>(dx+10) && x<(dx+90)) && (y>dy && y<(dy+20)))
		{
			document.body.style.cursor  = 'pointer';
			return;
		}
		else
		{
			document.body.style.cursor = 'default';
		}
	}

	for(idx in verticalLines)
	{
		dx = verticalLines[idx].xPos;
		dy = verticalLines[idx].yPos;
		if((x>dx && x<dx+20) && (y>dy+10 && y<dy+90))
		{
			document.body.style.cursor = 'pointer';
			return;
		}
		else
		{
			document.body.style.cursor = 'default';
		}
	}
}

function executeMouseClick(ev){
	if(turn == "HUMAN")
	{	
		var x, y;
		if (ev.layerX || ev.layerX == 0)
		{ // Firefox
			x = ev.layerX;
			y = ev.layerY;
		}
		else if (ev.offsetX || ev.offsetX == 0)
		{ // Opera
			x = ev.offsetX;
			y = ev.offsetY;
		}

		document.getElementById("pos").innerHTML = "Position clicked: "+x+","+y;
		
	
		
		var lineClicked = getClickedLine(x,y);
		if(lineClicked!=null && lineClicked.state!="CHECKED")
		{
			lineClicked.image.onload = function(){
				ctx.drawImage(lineClicked.image,lineClicked.xPos,lineClicked.yPos);
			}
			lineClicked.state = "CHECKED";
			if(lineClicked.orient == "V")
			{
				lineClicked.image.src = "grayvlinetaken.png";
			}
			else
			{
				lineClicked.image.src = "grayhlinetaken.png";
			}
			
			var associatedBoxes = getAssociatedBoxes(lineClicked);
			if(associatedBoxes.length>0){
				for(idx in associatedBoxes){
					if(associatedBoxes[idx].owner == "" && getUncheckLinesInBox(associatedBoxes[idx]).length == 0)
					{
						associatedBoxes[idx].owner ="HUMAN";
						humanScore++;
						associatedBoxes[idx].image.src = "human.jpg";			
						ctx.drawImage(associatedBoxes[idx].image,(startX + associatedBoxes[idx].col*100+25),(startY + associatedBoxes[idx].row*100+25));
						canvas.addEventListener("click",executeMouseClick,false);	
						turn="HUMAN";
						return;
					}
				}				
			}
			document.getElementById("turn").innerHTML = "Turn: Machine";	
			turn ="MACHINE";			
		}
		else
		{
			return;
		}
		
		if(turn == "MACHINE"){
			setTimeout("machineTurn()", 500);
			canvas.removeEventListener("click",executeMouseClick,false);
			turn = "HUMAN";
		}
	}		
}

function getAssociatedBoxes(mLine){ //this can be improved
	var associatedBoxes = new Array();
	for(i=0;i<boxes.length;i++){
		if(mLine.orient=="V")
		{
			if(boxes[i].leftLine.name == mLine.name)
			{
				associatedBoxes.push(boxes[i]);
			}
			else if(boxes[i].rightLine.name == mLine.name)
			{
				associatedBoxes.push(boxes[i]);
			}			
		}
		else
		{
			if(boxes[i].topLine.name == mLine.name)
			{
				associatedBoxes.push(boxes[i]);
			}
			else if(boxes[i].bottomLine.name == mLine.name)
			{
				associatedBoxes.push(boxes[i]);
			}
		}
		if(associatedBoxes.length==2) //two boxes max
			break;	
	}
	return associatedBoxes;
}

function checkIfOver(){
	for(idx in boxes)
	{
		if(boxes[idx].owner == "")
			return true;
	}
	if(humanScore>machineScore)
	{
		alert("You the Human OWN!!\n Human: "+humanScore+"\nMachine: "+machineScore);
		return;
	}
	else if(humanScore<machineScore)
	{
		alert("Sorry the Machine OWN!!\n Human: "+humanScore+"\nMachine: "+machineScore);
		return;
	}
	else
	{
		alert("DRAW!!\n Human: "+humanScore+"\nMachine: "+machineScore);
		return;
	}	
}

function getUncheckLinesInBox(mbox){
	var uncheckLines = new Array();
	if(mbox.topLine.state == "DRAWN")
		uncheckLines.push(mbox.topLine);
	if(mbox.bottomLine.state == "DRAWN")
		uncheckLines.push(mbox.bottomLine);
	if(mbox.leftLine.state == "DRAWN")
		uncheckLines.push(mbox.leftLine);
	if(mbox.rightLine.state == "DRAWN")
		uncheckLines.push(mbox.rightLine);
	return uncheckLines;
}


function machineTurn(){
	checkIfOver();
	var boxWith1Unchecked = new Array();
	var boxWith2Unchecked = new Array();
	var boxWith3Unchecked = new Array();
	var boxWith4Unchecked = new Array();
	for(index in boxes){
		var uLines = getUncheckLinesInBox(boxes[index]);
		if(uLines.length == 1)
			boxWith1Unchecked.push(boxes[index]);
		else if(uLines.length == 2)
			boxWith2Unchecked.push(boxes[index]);
		else if(uLines.length == 3)
			boxWith3Unchecked.push(boxes[index]);
		else if(uLines.length == 4)
			boxWith4Unchecked.push(boxes[index]);
	}
	var boxWith3UnchecksNotSafe = false;
	if(boxWith1Unchecked.length>0)
	{		
		var uncheckLines = getUncheckLinesInBox(boxWith1Unchecked[0]);
		uncheckLines[0].image.onload = function(){
			ctx.drawImage(uncheckLines[0].image,uncheckLines[0].xPos,uncheckLines[0].yPos);
		}
		uncheckLines[0].state = "CHECKED";
		if(uncheckLines[0].orient == "V")
		{
			uncheckLines[0].image.src = "grayvlinetakenr.png";
		}
		else
		{
			uncheckLines[0].image.src = "grayhlinetakenr.png";
		}
		var associatedBoxes = getAssociatedBoxes(uncheckLines[0]);
		if(associatedBoxes.length>0){
			for(idx in associatedBoxes){
				if(associatedBoxes[idx].owner == "" && getUncheckLinesInBox(associatedBoxes[idx]).length == 0)
				{
					associatedBoxes[idx].owner ="MACHINE";
					machineScore++;
					associatedBoxes[idx].image.src = "machine.jpg";			
					ctx.drawImage(associatedBoxes[idx].image,(startX + associatedBoxes[idx].col*100+30),(startY + associatedBoxes[idx].row*100+30));	
				}
			}				
		}
		setTimeout("machineTurn()", 500);		
		return;
	}
	else if(boxWith3Unchecked.length > 0){
		for(i = 0; i<boxWith3Unchecked.length;i++)
		{
			var uncheckLines = getUncheckLinesInBox(boxWith3Unchecked[i]);
			for(lin = 0;lin<uncheckLines.length;lin++)
			{
				if(isSafeToCheck(uncheckLines[lin])==true)
				{
					uncheckLines[lin].image.onload = function() {
						ctx.drawImage(uncheckLines[lin].image,uncheckLines[lin].xPos,uncheckLines[lin].yPos);
					}
					uncheckLines[lin].state = "CHECKED";
					if(uncheckLines[lin].orient == "V")
					{
						uncheckLines[lin].image.src = "grayvlinetakenr.png";
					}
					else
					{
						uncheckLines[lin].image.src = "grayhlinetakenr.png";
					}
					document.getElementById("turn").innerHTML = "Turn: "+document.getElementById("player1").value;
					canvas.addEventListener("click",executeMouseClick,false);	
					boxWith3UnchecksNotSafe = false;					
					return;
				}
				else
				{
					boxWith3UnchecksNotSafe = true;
					continue;
				}
			}
		}
		if(boxWith3UnchecksNotSafe == true && boxWith4Unchecked.length == 0)
		{
			// check that has less harm. improve latter.
			var uncheckLines = getUncheckLinesInBox(boxWith3Unchecked[0]);
			uncheckLines[0].image.onload = function() {
				ctx.drawImage(uncheckLines[0].image,uncheckLines[0].xPos,uncheckLines[0].yPos);
			}
			uncheckLines[0].state = "CHECKED";
			if(uncheckLines[0].orient == "V")
			{
				uncheckLines[0].image.src = "grayvlinetakenr.png";
			}
			else
			{
				uncheckLines[0].image.src = "grayhlinetakenr.png";
			}
			document.getElementById("turn").innerHTML = "Turn: "+document.getElementById("player1").value;
			canvas.addEventListener("click",executeMouseClick,false);			
			return;						
		}
	}
	if(boxWith4Unchecked.length > 0){
		var uncheckLines = getUncheckLinesInBox(boxWith4Unchecked[0]);
		uncheckLines[0].image.onload = function() {
			ctx.drawImage(uncheckLines[0].image,uncheckLines[0].xPos,uncheckLines[0].yPos);
		}
		uncheckLines[0].state = "CHECKED";
		if(uncheckLines[0].orient == "V")
		{
			uncheckLines[0].image.src = "grayvlinetakenr.png";
		}
		else
		{
			uncheckLines[0].image.src = "grayhlinetakenr.png";
		}
		document.getElementById("turn").innerHTML = "Turn: "+document.getElementById("player1").value;
		canvas.addEventListener("click",executeMouseClick,false);			
		return;
	}
	else if(boxWith2Unchecked.length > 0){ //improve
	
		//checked that is less costly.
		
		for(boxIndex in boxWith2Unchecked)
		{			
			var uncheckLines = getUncheckLinesInBox(boxWith2Unchecked[boxIndex]);
			var singleCost = 0;
			for(unlin in uncheckLines){
				chain = 0;
				var cost = findCost(uncheckLines[unlin],boxWith2Unchecked[boxIndex]);
				singleCost +=cost;
			}
			if(singleCost<lowestCost){
				lowestCost = singleCost;
				lineToCheck = uncheckLines[0];
			}
			if(lowestCost<3){
				break;
			}
		}
		//check the line
		lineToCheck.image.onload = function() {
			ctx.drawImage(lineToCheck.image,lineToCheck.xPos,lineToCheck.yPos);
		}
		lineToCheck.state = "CHECKED";
		if(lineToCheck.orient == "V")
		{
			lineToCheck.image.src = "grayvlinetakenr.png";
		}
		else
		{
			lineToCheck.image.src = "grayhlinetakenr.png";
		}
		document.getElementById("turn").innerHTML = "Turn: "+document.getElementById("player1").value;
		canvas.addEventListener("click",executeMouseClick,false);			
		return;
	}	
}
var chain =0;
var previousBox=null;
var startingBox = null;
var preCommonBoxes=null;

function getNeighboringBox(mLine,box){
	for(i=0;i<boxes.length;i++){
		if(boxes[i]==box)
			continue;
		if(mLine.orient=="V")
		{
			if(boxes[i].leftLine.name == mLine.name)
			{
				return boxes[i]
			}
			else if(boxes[i].rightLine.name == mLine.name)
			{
				return boxes[i]
			}			
		}
		else
		{
			if(boxes[i].topLine.name == mLine.name)
			{
				return boxes[i]
			}
			else if(boxes[i].bottomLine.name == mLine.name)
			{
				return boxes[i]
			}
		}		
	}
	return null;
}

function findCost(cline,cbox)
{
	
	chain++;
	var unchckLin = getUncheckLinesInBox(cbox);
	if(unchckLin.length == 2){
		var selectedLine = unchckLin[0]==cline?unchckLin[1]:unchckLin[0];
		var neighborBox = getNeighboringBox(selectedLine,cbox);
		if(neighborBox != null){
			return findCost(selectedLine,neighborBox);		
		}		
	}	
	return chain;
}

function isSafeToCheck(uline){
	associatedboxes = getAssociatedBoxes(uline);
	for(asidx in associatedboxes){
		if(getUncheckLinesInBox(associatedboxes[asidx]).length==2)
			return false;
	}
	return true;
}


function getClickedLine(x,y){

	//may need parent condition to limit the iteration.
	for(idx = 0;idx<horizontalLines.length;idx++)
	{
		dx = horizontalLines[idx].xPos;
		dy = horizontalLines[idx].yPos;
		if((x>(dx+10) && x<(dx+90)) && (y>dy && y<(dy+20)))
		{
			return horizontalLines[idx];
		}
	}

	for(idx in verticalLines){
		dx = verticalLines[idx].xPos;
		dy = verticalLines[idx].yPos;
		if((x>dx && x<dx+20) && (y>dy+10 && y<dy+90))
		{
			return verticalLines[idx];
		}
	}
	return null;
}

function buildStage(){

	//creating lines horizontal
	horizontalLines = new Array();
	for(i=0;i<(hr*vt+hr);i++)
	{
		var newLine = new Line();
		newLine.name = "h"+i;
		newLine.orient ="H";
		newLine.state = "NEW";
		newLine.image = new Image();
		newLine.image.src ="grayhline.png";
		horizontalLines.push(newLine);
	}

	//creating lines vertical
	verticalLines = new Array();
	for(i=0;i<(hr*vt+vt);i++)
	{
		var newLine = new Line();
		newLine.name = "v"+i;
		newLine.orient ="V";
		newLine.state = "NEW";
		newLine.image = new Image();
		newLine.image.src ="grayvline.png";
		verticalLines.push(newLine);
	}

	//creating boxes
	boxes = new Array(hr*vt);
	var k=0;
	for(j=0;j<vt;j++)
	{
		for(i=0;i<hr;i++)
		{
			var newBox = new Box();
			newBox.row = j;
			newBox.col = i;
			newBox.topLine = horizontalLines[k];
			newBox.bottomLine = horizontalLines[k+hr];
			newBox.leftLine = verticalLines[j+k];
			newBox.rightLine = verticalLines[j+k+1];
			newBox.draw_box();
			newBox.owner = "";
			newBox.image = new Image();			
			boxes[k] = newBox;
			k++;
		}
	}
}

function drawBox(){

	ctx.beginPath();
	dx = startX + this.col*100;
	dy = startY + this.row*100;

	if(this.topLine.state!="DRAWN")
	{
		ctx.drawImage(this.topLine.image,dx+5,dy)
		this.topLine.xPos = dx+5;
		this.topLine.yPos = dy;
		this.topLine.state="DRAWN";
	}
	if(this.bottomLine.state!="DRAWN")
	{
		ctx.drawImage(this.bottomLine.image,dx+5,dy+100)
		this.bottomLine.xPos = dx+5;
		this.bottomLine.yPos = dy+100;
		this.bottomLine.state="DRAWN";
	}
	if(this.leftLine.state!="DRAWN")
	{
		ctx.drawImage(this.leftLine.image,dx,dy)
		this.leftLine.xPos = dx;
		this.leftLine.yPos = dy;
		this.leftLine.state="DRAWN";
	}
	if(this.rightLine.state!="DRAWN")
	{
		ctx.drawImage(this.rightLine.image,dx+100,dy)
		this.rightLine.xPos = dx+100;
		this.rightLine.yPos = dy;
		this.rightLine.state="DRAWN";
	}
	ctx.closePath();
}

function Line(){
	this.name="";
	this.xPos="";
	this.yPos="";
	this.orient;
	this.state;
	this.image;
}

function Box(){
	this.row;
	this.col;
	this.topLine;
	this.bottomLine;
	this.leftLine;
	this.rightLine;
	this.owner=="";
	this.image;
	this.draw_box=drawBox;
	
}