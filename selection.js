
let tolerance;
let C;
let selectionCols;
let selectionHue;
let pxLayer;
let currentPxEdge;
let img1;
let selected;
let activeSelection;
let hoverLayer;
let tool;
let tools;
let toolHover;
let circleSelectSize;
let circleDeselectSize;
let cursorType;
let activity;
let colHSB;
let fillCol;

let tom;
function preload() {
  tom = loadImage('Tom.jpg');
}

function setup() {
	angleMode(DEGREES);
	W = window.innerWidth;
	H = window.innerHeight;
	canvas = createCanvas(W, H);
	tolerance = 20; // 0 is MIN, 255 is MAX
	circleSelectSize = 15;
	circleDeselectSize = 15;
	C = [0,0,0];
	selected = 0;
	activeSelection = 0;
	tool = 'Magic Wand';
	tools = ['Magic Wand', 'Circle Select', 'Circle Deselect', 'Colour Fill'];
	
	selectionCols = [[245, 66, 66],[252, 123, 3],[245, 224, 66],[208, 240, 161],[130, 224, 130],[130, 224, 205],[78, 163, 242],[133, 130, 224],[222, 140, 186]];
	selectionHue = [];
	for (var col=0; col<selectionCols.length; col+=1){selectionHue.push(RGB2HSB(selectionCols[col]));}
	
	fillCol = [255,0,0];
	
	img1 = initImg(tom,W/10,H/10,2*W/3,3*H/5);
	
	background(25);	
	img1.drawMod();
}

function initImg(IMG,x,y,maxW,maxH){
	if (maxW*IMG.height/IMG.width>maxH){
		return new img(IMG,int(x),int(y),int(IMG.width*(maxH/IMG.height)),int(maxH));
	} else {
		return new img(IMG,int(x),int(y),int(maxW));
	}
}

function HSB2RGB(col){
	let H = col[0]%360;
	let S = col[1]%1;
	let B = col[2]%1;
	let C = S * B;
	let X = C * (1-abs((H/60)%2 - 1))
	let m = B - C;
	let r;
	let g;
	let b;
	if (H<60 || H>=300){r = C;} else if (H<120 || H>=240){r = X;} else {r = 0;}
	if (H>=60 && H<180){g = C;} else if (H>=240){g = 0;} else {g = X;}
	if (H>=180 && H<300){b = C;} else if (H<120){b = 0;} else {b = X;}
	return [255*(r+m),255*(g+m),255*(b+m)];
}

function RGB2HSB(col){
	let R = col[0]/255;
	let G = col[1]/255;
	let B = col[2]/255;
	let Cmax = max(R,G,B);
	let Cmin = min(R,G,B);
	let D = Cmax - Cmin;
	let h;
	let s;
	let b;
	if (!D){h = 0;} else if (Cmax===R){h = 60*(((G-B)/D)%6);} else if (Cmax===G){h = 60*(((B-R)/D)+2);} else if (Cmax===B){h = 60*(((R-G)/D)+4);}
	if (!Cmax){s=0;} else {s = D/Cmax;}
	b = Cmax;
	return [h,s,b];
}

function toolCursors(){
	cursorType = 'none';
	if (tool === 'Magic Wand'){
		stroke(255,255,255,100);
		strokeWeight(1);
		fill(0,0,0);
		rect(mouseX-3,mouseY+3,4,15);
		rect(mouseX-5,mouseY-2,3,3);
		rect(mouseX-2,mouseY-5,3,3);
		rect(mouseX+1,mouseY-1,3,3);
	} else if (tool === 'Circle Select'){
		noFill();
		stroke(255,255,255,150);
		strokeWeight(1);
		ellipse(mouseX,mouseY,2*circleSelectSize,2*circleSelectSize);
		line(mouseX-circleSelectSize/5,mouseY,mouseX+circleSelectSize/5,mouseY);
		line(mouseX,mouseY-circleSelectSize/5,mouseX,mouseY+circleSelectSize/5);
		stroke(0,0,0,150);
		ellipse(mouseX,mouseY,2*circleSelectSize+2,2*circleSelectSize+2);
		line(mouseX-circleSelectSize/5,mouseY-1,mouseX+circleSelectSize/5,mouseY-1);
		line(mouseX-1,mouseY-circleSelectSize/5,mouseX-1,mouseY+circleSelectSize/5);
	} else if (tool === 'Circle Deselect'){
		noFill();
		stroke(255,255,255,150);
		strokeWeight(1);
		ellipse(mouseX,mouseY,2*circleDeselectSize,2*circleDeselectSize);
		line(mouseX-circleDeselectSize/5,mouseY,mouseX+circleDeselectSize/5,mouseY);
		stroke(0,0,0,150);
		ellipse(mouseX,mouseY,2*circleDeselectSize+2,2*circleDeselectSize+2);
		line(mouseX-circleDeselectSize/5,mouseY-1,mouseX+circleDeselectSize/5,mouseY-1);
	}  else if (tool === 'Colour Fill'){
		strokeWeight(1);
		push();
		translate(mouseX-10,mouseY+13);
		rotate(15);
		noStroke();
		fill(fillCol[0],fillCol[1],fillCol[2]);
		rect(-10,-3,20,14);
		triangle(-10,-3,10,-3,10,-6);
		stroke(200,200,200);
		arc(0,11,20,8,0,180);
		noFill();
		line(-10,-13,-10,11);
		line(10,-13,10,11);
		ellipse(0,-13,20,5);
		stroke(20,20,20);
		arc(0,12,22,8,10,170);
		line(-11,-13,-11,12);
		line(11,-13,11,13);
		ellipse(0,-13,22,6);
		pop();
		push();
		noFill();
		translate(mouseX-10,mouseY);
		rotate(-30);
		stroke(200,200,200);
		arc(2,2,5,35,160,355);
		stroke(20,20,20);
		arc(2,2,7,39,160,355);
		pop();
	}
}

class img {
	constructor (IMG,x,y,w,h){
		this.IMG = IMG;
		this.history = 0;
		this.x = x;
		this.y = y;
		this.w = w;
		if (!w){
			this.w = IMG.width;
		} else {
			this.h = IMG.height;
		}
		if (!h){
			this.h = int(this.w*IMG.height/IMG.width);
		} else {
			this.h = h;
		}
		this.IMG.resize(this.w,this.h);
		this.modImgs = [];
		this.modImgs.push(createImage(this.w,this.h));
		this.modImgs[0].copy(this.IMG, 0, 0, this.w, this.h, 0, 0, this.w, this.h);
		this.layers = [];
		this.layers.push(createImage(this.w,this.h));
		this.layers[0].copy(this.IMG, 0, 0, this.w, this.h, 0, 0, this.w, this.h);
		this.selectNum = 1;
		this.depthForGraphic;
		this.maxDepthForGraphic=1;
		this.currentPxEdge;
		this.px = [];
		for (var i=0; i<this.w*this.h; i+=1){this.px.push(0);}
		this.pxLayer = [];
		for (var i=0; i<this.w*this.h; i+=1){this.pxLayer.push(0);}
		this.transparentBack = createGraphics(this.w,this.h);
		this.buildTransparencyGrid();
	}
	
/*
	create() {
		let col;
		let strokeweight;
		fill(25);
		rect(this.x,this.y,this.w,this.h);
		for (var i=0; i<150; i+=1){
			col = random(0,255);
			strokeweight = random(20,60);
			stroke(col-10,col,col,random(100,255));
			strokeWeight(strokeweight);
			point(this.x + random(strokeweight/2,this.w-strokeweight/2),this.y+random(strokeweight/2,this.h-strokeweight/2));
		}
		strokeWeight(1);
		stroke(255,0,0);
		line(this.x,this.y,this.x+this.w,this.y);
		line(this.x,this.y+this.h,this.x+this.w,this.y+this.h);
		line(this.x,this.y,this.x,this.y+this.h);
		line(this.x+this.w,this.y,this.x+this.w,this.y+this.h);
	}
*/

	buildTransparencyGrid(){
		this.transparentBack.noStroke();
		let nY = 15;
		let dY = this.h/nY;
		let dX = this.w/int(this.w/dY);
		let nX = this.w/dX;
		for (var y=0; y<nY; y+=1){
			for (var x=0; x<nX; x+=1){
				this.transparentBack.fill(170,170,170);
				this.transparentBack.rect(x*dX,y*dY,dX/2,dY/2,1);
				this.transparentBack.rect(x*dX+dX/2,y*dY+dY/2,dX/2,dY/2,1);
				this.transparentBack.fill(120,120,120);
				this.transparentBack.rect(x*dX,y*dY+dY/2,dX/2,dY/2,1);
				this.transparentBack.rect(x*dX+dX/2,y*dY,dX/2,dY/2,1);
			}
		}
	}
	
	drawTransparencyGrid(){
		image(this.transparentBack,this.x,this.y);
	}
	
	drawMod(h) {
		if (!h){
			h = this.history;
		}
		image(this.modImgs[h],this.x,this.y,this.w,this.h);
	}
	
	drawOriginal(){
		image(this.IMG,this.x,this.y,this.w,this.h);
	}
		
	drawLayer(layer) {
		if (layer < this.selectNum){
			image(this.layers[layer],this.x,this.y,this.w,this.h);
		} else {
			this.drawMod();
		}
	}
	
	colourPix(img,pix,c){
		img.pixels[4*(pix)] = c[0];
		img.pixels[4*(pix)+1] = c[1];
		img.pixels[4*(pix)+2] = c[2];
		if (c.length>3){
			img.pixels[4*(pix)+3] = c[3];
		} else {
			img.pixels[4*(pix)+3] = 255;
		}
	}
	
	updateLayer(layer){
		this.modImgs[this.history].loadPixels();
/*
		print('history:' + this.history);
		print('modImgs R:' + this.modImgs[this.history].pixels[0]);
		print('modImgs G:' + this.modImgs[this.history].pixels[1]);
		print('modImgs B:' + this.modImgs[this.history].pixels[2]);
		print('modImgs A:' + this.modImgs[this.history].pixels[3]);
*/
		
		this.layers[layer] = createImage(this.w,this.h);
		this.layers[layer].copy(this.modImgs[this.history], 0, 0, this.w, this.h, 0, 0, this.w, this.h);
		this.layers[layer].loadPixels();
		
		for (var pix=0; pix<this.px.length; pix+=1){
			if (this.px[pix] && (!layer || this.pxLayer[pix]===layer)){
				colHSB = selectionHue[(this.pxLayer[pix]-1)%selectionHue.length];
				if (this.px[pix]===1){
					this.colourPix(this.layers[layer],pix,HSB2RGB([colHSB[0],3*(colHSB[1])/4,colHSB[2]]));
				} else {
					this.colourPix(this.layers[layer],pix,HSB2RGB([colHSB[0],3*(colHSB[1])/4,(colHSB[2])*(1-this.px[pix]/this.maxDepthForGraphic)]));
				}
			}
		}
		this.layers[layer].updatePixels();
/*
		print('layer:' + layer);
		print('layers R:' + this.layers[layer].pixels[0]);
		print('layers G:' + this.layers[layer].pixels[1]);
		print('layers B:' + this.layers[layer].pixels[2]);
		print('layers A:' + this.layers[layer].pixels[3]);
		print('\n')
*/
	}
	
	newPixSelect(pix){
		this.px[pix] = this.depthForGraphic+1;
		this.pxLayer[pix] = activeSelection;
		this.currentPxEdge[this.depthForGraphic].push(pix);
	}
	
	testPass(pix,c) {
		return abs(this.modImgs[this.history].pixels[4*(pix)]-c[0])+
			   abs(this.modImgs[this.history].pixels[4*(pix)+1]-c[1])+
			   abs(this.modImgs[this.history].pixels[4*(pix)+2]-c[2])<=3*tolerance;
	}
	
	imageHover(){
		if (mouseX>this.x && mouseX<this.x+this.w && mouseY>this.y && mouseY<this.y+this.h){
			return true;
		} else {
			return false;
		}
	}
	
	imageRun(){
		if (this.imageHover()){
			toolCursors();
		}
	}

	newMagicWand(mX,mY) {
		if (this.imageHover()){
			let index = (mX-this.x)+(mY-this.y)*this.w;
			if (this.px[index]===0){
				if (this.selectNum===1 || selected===this.selectNum && this.selectNum<=8){
					this.layers.push(createImage(this.w,this.h));
					this.layers[this.selectNum].copy(this.modImgs[this.history], 0, 0, this.w, this.h, 0, 0, this.w, this.h);
					this.selectNum += 1;
					activeSelection = this.selectNum-1;
				}
			
				this.modImgs[this.history].loadPixels();
				
				C = [
					this.modImgs[this.history].pixels[4*(index)],
					this.modImgs[this.history].pixels[4*(index)+1],
					this.modImgs[this.history].pixels[4*(index)+2],
					this.modImgs[this.history].pixels[4*(index)+3]];
				
				this.modImgs[this.history].updatePixels();
	
				this.depthForGraphic = 1;
				this.px[index]=1;
				this.currentPxEdge = [[index]];
				this.pxLayer[index] = activeSelection;
				while (this.currentPxEdge[this.depthForGraphic-1].length) {
					this.currentPxEdge.push([]);
					for (var i=0; i<this.currentPxEdge[this.depthForGraphic-1].length; i+=1){
						var pix = this.currentPxEdge[this.depthForGraphic-1][i];
						if (this.px[pix]===this.depthForGraphic && this.pxLayer[pix]===activeSelection){
							if (this.px[pix-1]===0 && this.testPass(pix-1,C) && int(pix/this.w)===int((pix-1)/this.w)){this.newPixSelect(pix-1);}
							if (this.px[pix-1*this.w]===0 && this.testPass(pix-1*this.w,C)){this.newPixSelect(pix-1*this.w);}
							if (this.px[pix+1]===0 && this.testPass(pix+1,C) && int(pix/this.w)===int((pix+1)/this.w)){this.newPixSelect(pix+1);}
							if (this.px[pix+1*this.w]===0 && this.testPass(pix+1*this.w,C)){this.newPixSelect(pix+1*this.w);}
						}
					}
					this.depthForGraphic += 1;
				}
				if (!this.maxDepthForGraphic || this.depthForGraphic>this.maxDepthForGraphic){
					this.maxDepthForGraphic=this.depthForGraphic;
				}
				
				let leftPix;
				let rightPix;
				let upPix;
				let downPix;
				for (var pix=0; pix<this.pxLayer.length; pix+=1){
					if (this.pxLayer[pix] !== activeSelection){
						leftPix=0;
						rightPix=0;
						upPix=0;
						downPix=0;
						if (this.pxLayer[pix-1] === activeSelection){
							leftPix = 1;
						}
						if (this.pxLayer[pix+1] === activeSelection){
							rightPix = 1;
						}
						if (this.pxLayer[pix-this.w] === activeSelection){
							upPix = 1;
						}
						if (this.pxLayer[pix+this.w] === activeSelection){
							downPix = 1;
						}
						if (leftPix + rightPix + upPix + downPix >=3){
							this.pxLayer[pix] = activeSelection;
							this.px[pix] = 1;
						}
					}
				}
				this.updateLayer(selected);
			}
		}
	}
	
	newCircleSelect(mX,mY) {
		if (this.imageHover()){
			if (this.selectNum===1 || selected===this.selectNum && this.selectNum<=8){
				this.layers.push(createImage(this.w,this.h));
				this.layers[this.selectNum].copy(this.modImgs[this.history], 0, 0, this.w, this.h, 0, 0, this.w, this.h);
				this.selectNum += 1;
				activeSelection = this.selectNum-1;
			}
			let index = (mX-this.x)+(mY-this.y)*this.w;
			let anySelect = false;
			let dSquare;
			for (var pix=index-circleSelectSize*this.w; pix<index+circleSelectSize*this.w; pix+=1){
				dSquare = Math.pow(pix%this.w - index%this.w,2) + Math.pow(int(pix/this.w)-int(index/this.w),2);
				if (!this.pxLayer[pix] && dSquare <= circleSelectSize*circleSelectSize){
					this.pxLayer[pix]=activeSelection;
					this.px[pix] = 1;
					anySelect = true;
				}
			}
			
			if (anySelect && (activeSelection===this.selectNum)){
				this.layers.push(createImage(this.w,this.h));
				this.layers[this.selectNum].copy(this.modImgs[this.history], 0, 0, this.w, this.h, 0, 0, this.w, this.h);
				this.selectNum += 1;
				activeSelection = this.selectNum-1;
			}
			
			this.updateLayer(selected);
		}
	}
	
	newCircleDeselect(mX,mY) {
		if (this.imageHover() && this.selectNum>1){
			let index = (mX-this.x)+(mY-this.y)*this.w;
			let dSquare;
			
			this.modImgs[this.history].loadPixels();
			this.layers[selected].loadPixels();
			for (var pix=index-circleDeselectSize*this.w; pix<index+circleDeselectSize*this.w; pix+=1){
				dSquare = Math.pow(pix%this.w - index%this.w,2) + Math.pow(int(pix/this.w)-int(index/this.w),2);
				if (this.pxLayer[pix]===activeSelection && dSquare <= circleDeselectSize*circleDeselectSize){
					this.pxLayer[pix] = 0;
					this.px[pix] = 0;
					
					this.layers[selected].pixels[4*(pix)] = this.modImgs[this.history].pixels[4*(pix)];
					this.layers[selected].pixels[4*(pix)+1] = this.modImgs[this.history].pixels[4*(pix)+1];
					this.layers[selected].pixels[4*(pix)+2] = this.modImgs[this.history].pixels[4*(pix)+2];
					this.layers[selected].pixels[4*(pix)+3] = this.modImgs[this.history].pixels[4*(pix)+3];
				}
			}
			this.layers[selected].updatePixels();
		}
	}
	
	selectToCol(col,select){
		if (this.history===this.modImgs.length-1){
			this.modImgs.push(createImage(this.w,this.h));
			this.history += 1;
			this.modImgs[this.history].copy(this.modImgs[this.history-1], 0, 0, this.w, this.h, 0, 0, this.w, this.h);
		}
		this.modImgs[this.history].loadPixels();
		for (var pix=0; pix<this.px.length; pix+=1){
			if (this.pxLayer[pix]===select){
				this.colourPix(this.modImgs[this.history],pix,col);
			}
		}
		this.modImgs[this.history].updatePixels();
		selected = this.selectNum;
	}
	
	clearLayer(layer){
		this.layers[layer].copy(this.modImgs[this.history], 0, 0, this.w, this.h, 0, 0, this.w, this.h);
		for (var pix=0; pix<this.px.length; pix+=1){
			if (this.pxLayer[pix]===layer){
				this.pxLayer[pix] = 0;
				this.px[pix] = 0;
			}
		}
	}
	
	undo(){
		if (this.history){
			this.history -= 1;
			this.updateLayer(selected);
		}
	}
	
	redo(){
		if (this.history<this.modImgs.length-1){
			this.history += 1;
			this.updateLayer(selected);
		}
	}
}


function selections(){
	textSize(14);
	textFont('Lato Light');
	textAlign(RIGHT,BASELINE);
	strokeWeight(1);
	for (var i=0; i<img1.selectNum+1; i+=1){
		if (i===selected){
			fill(255,255,255,180);
		} else {
			fill(255,255,255,100);
		}
		if (mouseX<W-40 && mouseX>W-60-textWidth('Background    ' + str(i)) && mouseY>40+50*(i) && mouseY<20+50*(i+1)){
			hoverLayer = i;
			cursorType = 'pointer';
		}
		noStroke();
		if (!i){
			noStroke();
			text('Background    ' + str(i),W-50,60+50*i);
			stroke(255,255,255,50);
			noFill();
			ellipse(W-155,55+50*i,6,6);
			if (activeSelection){
				fill(selectionCols[(activeSelection-1)%selectionCols.length][0],selectionCols[(activeSelection-1)%selectionCols.length][1],selectionCols[(activeSelection-1)%selectionCols.length][2],100);
				noStroke();
				ellipse(W-170,55+50*i,6,6);
			}
		} else if (i<img1.selectNum) {
			noStroke();
			text('Select Layer   ' + str(i),W-50,60+50*i);
			stroke(255,255,255,50);
			line(W-70,30+50*i,W-50,30+50*i);
			fill(selectionCols[(i-1)%selectionCols.length][0],selectionCols[(i-1)%selectionCols.length][1],selectionCols[(i-1)%selectionCols.length][2],150);
			noStroke();
			
			ellipse(W-155,55+50*i,6,6);
		} else if (i===img1.selectNum){
			noStroke();
			text('Edited Image',W-50,60+50*i);
			stroke(255,255,255,50);
			line(W-70,30+50*i,W-50,30+50*i);
		}
	}
	
	stroke(255,255,255,150);
	line(W-70,H-60,W-50,H-60);
	line(W-60,H-70,W-60,H-50);
	noFill();
	stroke(255,255,255,75);
	ellipse(W-60,H-60,40,40);
	
	if (dist(mouseX,mouseY,W-60,H-60)<20){
		cursorType = 'pointer';
	}
}

function toolBar(){
	textSize(14);
	textFont('Lato-Light');
	textAlign(CENTER,CENTER);
	stroke(255,255,255,50);
	line(5*W/40,8*H/10-10,5*W/40,8*H/10+10);
	toolHover = 0;
	for (var t=0; t<tools.length; t+=1){
		if (tool===tools[t]){
			fill(255,255,255,180);
		} else  {
			fill(255,255,255,100);
		}
		noStroke();
		text(tools[t],(15+10*t)*W/80,8*H/10);
		stroke(255,255,255,50);
		line((20+10*t)*W/80,8*H/10-10,(20+10*t)*W/80,8*H/10+10);
		if (mouseX>(10+10*t)*W/80 && mouseX<(20+10*t)*W/80 && mouseY>8*H/10-10 && mouseY<8*H/10+10){
			cursorType = 'pointer';
			toolHover = tools[t];
		}
	}
	
	if (tool==='Magic Wand'){
		text('Tolerance:  ' + str(tolerance),15*W/80,17*H/20)
	} else if (tool==='Circle Select'){
		fill(255,255,255,100);
		textSize(12);
		text('Circle Select Size:  ' + str(circleSelectSize),25*W/80,17*H/20)
	} else if (tool==='Circle Deselect'){
		fill(255,255,255,100);
		textSize(12);
		text('Circle Deselect Size:  ' + str(circleDeselectSize),35*W/80,17*H/20)
	} else if (tool==='Colour Fill'){
		fill(255,255,255,100);
		textSize(12);
		if (fillCol.length>3 && fillCol[3]!==255){
			text('RGBA:  ' + str(fillCol[0]) +', '+ str(fillCol[1]) +', '+ str(fillCol[2]) +', '+ str(fillCol[3]),45*W/80,17*H/20)
		} else {
			text('RGB:  ' + str(fillCol[0]) +', '+ str(fillCol[1]) +', '+ str(fillCol[2]),45*W/80,17*H/20)
		}
		noFill();
		stroke(255,255,255,50);
		rect(45*W/80-8,17*H/20+20-3,15,15);
		noStroke();
		fill(fillCol[0],fillCol[1],fillCol[2]);
		rect(45*W/80-5,17*H/20+20,10,10);
		if (mouseX>45*W/80-8 && mouseX<45*W/80+7 && mouseY>17*H/20+20-3 && mouseY<17*H/20+20+12){
			cursorType = 'pointer';
		}
	}
}

function draw(){
	if (activity){
		cursorType = 'default';
		updateScreen();
		img1.imageRun();
	}
	activity = false;
	cursor(cursorType);
}

function updateScreen(){
	hoverLayer = -1;

	background(25);	
	img1.drawTransparencyGrid();
	img1.drawLayer(selected);
	selections();
	toolBar();
}


function mouseMoved(){
	activity = true;
}

function mouseClicked(){
	activity = true;
	
	if (tool==='Magic Wand'){
		img1.newMagicWand(mouseX,mouseY);
	} else if (tool==='Circle Select'){
		img1.newCircleSelect(mouseX,mouseY);
	} else if (tool==='Circle Deselect'){
		img1.newCircleDeselect(mouseX,mouseY);
	}  else if (tool==='Colour Fill'){
		if (img1.imageHover()){
			img1.selectToCol(fillCol,selected);
		} else if (mouseX>45*W/80-8 && mouseX<45*W/80+7 && mouseY>17*H/20+20-3 && mouseY<17*H/20+20+12){
			fillCol = [int(prompt('Red (0-255):')),int(prompt('Green (0-255):')),int(prompt('Blue (0-255):')),int(prompt('Alpha (0-255):'))];
			for (var i=0; i<4; i+=1){
				if (!fillCol[i] && fillCol[i]!==0){
					fillCol[i] = 255;
				}
			}
		}
	}

	if (hoverLayer>=0){
		selected = hoverLayer;
		if (hoverLayer>0){
			activeSelection = hoverLayer;
		}
		if (hoverLayer<img1.selectNum){
			img1.updateLayer(selected);
			img1.updateLayer(activeSelection);
		}
	}
	if (dist(mouseX,mouseY,W-60,H-60)<20 && img1.selectNum<=9){
		img1.layers.push(createImage(img1.w,img1.h));
		img1.layers[img1.selectNum].copy(img1.modImgs[img1.history], 0, 0, img1.w, img1.h, 0, 0, img1.w, img1.h);
		img1.selectNum += 1;
		selected = img1.selectNum-1;
		activeSelection = img1.selectNum-1;
	}
	if (toolHover){
		tool = toolHover;
	}
}

function mouseDragged(){
	activity = true;

	if (tool==='Magic Wand'){
		img1.newMagicWand(mouseX,mouseY);
	} else if (tool==='Circle Select'){
		img1.newCircleSelect(mouseX,mouseY);
	} else if (tool==='Circle Deselect'){
		img1.newCircleDeselect(mouseX,mouseY);
	}
}

function mouseWheel(event) {
	activity = true;
	
	if (tool==='Magic Wand' && (tolerance>0 || event.delta>0)){
		tolerance += int(event.delta/20);
		if (tolerance<0){
			tolerance = 0;
		}
	} else if (tool==='Circle Select' && (circleSelectSize>0 || event.delta>0)){
		circleSelectSize += int(event.delta/20);
		if (circleSelectSize<0){
			circleSelectSize = 0;
		}
	} else if (tool==='Circle Deselect' && (circleDeselectSize>0 || event.delta>0)){
		circleDeselectSize += int(event.delta/20);
		if (circleDeselectSize<0){
			circleDeselectSize = 0;
		}
	}
}

function keyTyped() {
	activity = true;
	
  if (keyIsDown(83)) {
    img1.modImgs[img1.history].save('tom_new', 'png');
  }
  if (keyIsDown(66)) {
  	img1.selectToCol([0,0,0,255],selected);
  }
  if (keyIsDown(67)) {
  	img1.selectToCol([0,0,0,0],selected);
  }
  if (keyIsDown(87)) {
  	img1.selectToCol([255,255,255,255],selected);
  }
  if (keyIsDown(32) && selected>0 && selected<=img1.selectNum) {
  	img1.clearLayer(selected);
  }
  if (keyIsDown(85)) {
    img1.undo();
  }
  if (keyIsDown(82)) {
    img1.redo();
  }
  
  if (keyIsDown(187)) {
	if (tool==='Magic Wand'){
		tolerance += 1;
	} else if (tool==='Circle Select'){
		circleSelectSize += 1;
	} else if (tool==='Circle Deselect'){
		circleDeselectSize += 1;
	}
  }
  if (keyIsDown(189)) {
	if (tool==='Magic Wand' && tolerance>0){
		tolerance -= 1;
	} else if (tool==='Circle Select' && circleSelectSize>0){
		circleSelectSize -= 1;
	} else if (tool==='Circle Deselect' && circleDeselectSize>0){
		circleDeselectSize -= 1;
	}
  }
}

window.onresize = function() {
	activity = true;
	
  resizeCanvas(windowWidth, windowHeight);
  W = windowWidth;
  H = windowHeight
};

