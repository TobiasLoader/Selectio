
let C;
let areaCols;
let areaHue;
let pxArea;
let currentPxEdge;
let img1;
let chosenArea;
let activeArea;
let hoverArea;
let currentTool;
let tools;
let toolHover;
let toolBarHeight;
let toolButtonWidth;
let toolButtonHeight;
let toolTabWidth;
let toolTabPadding;
let toolView;
let toolButtonHover;
let cursorType;
let activity;
let colHSB;
let colRGB;
let sidebarTopRHS;
let sidebarWidthRHS;
let sidebarWordWidthRHS;
let sidebarWordSeperationRHS;
let colAreaMethod;
let historyRecord;
let timeSec;
let maxPix;
let minPix;
let padding;
let themeColours;

let tom;
function preload() {
  tom = loadImage('Tom.JPG');
}

function setup() {
	themeColours = [color(135, 205, 212),color(25,25,25),color(23,23,23)];
	sidebarWidthRHS = 220;
	toolBarHeight = 120;
	padding = 50;
	
	textFont('Lato-Light');
	angleMode(DEGREES);
	imageMode(CENTER);
	W = window.innerWidth;
	H = window.innerHeight;
	canvas = createCanvas(W, H);
	C = [0,0,0];
	chosenArea = 0;
	activeArea = 0;
	toolView = false;
	currentTool = 'Magic Wand';
	tools = {
		'Magic Wand': new tool('Magic Wand', 0, {'Tolerance': 20},false),
		'Circle Select': new tool('Circle Select', 1, {'Radius': 15},false),
		'Circle Deselect': new tool('Circle Deselect', 2, {'Radius': 15},false),
		'Colour Fill': new tool('Colour Fill', 3, {},true),
		'Colour Stroke': new tool('Colour Stroke', 4, {},true),
		'Revert Area': new tool('Revert Area', 5, {}, false)
	};
	
	colAreaMethod = 2; // 1, 2, 3, 4 or 5
	
	areaCols = [[245, 66, 66],[252, 123, 3],[245, 224, 66],[208, 240, 161],[130, 224, 130],[130, 224, 205],[78, 163, 242],[133, 130, 224],[222, 140, 186]];
	areaHue = [];
	for (var col=0; col<areaCols.length; col+=1){areaHue.push(RGB2HSB(areaCols[col]));}
	
	img1 = initImg(tom,(W-sidebarWidthRHS)/2,toolBarHeight+(H-toolBarHeight)/2,W-sidebarWidthRHS - 2*padding,H-toolBarHeight - 2*padding);
	
	background(themeColours[1]);	
	img1.drawMod();
	activity = true;
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

function toolCursors(mX,mY,noneCursor){
	if (noneCursor){
		cursorType = 'none';
	}
	if (currentTool === 'Magic Wand'){
		push();
		translate(mX,mY);
		rotate(15);
		stroke(200,200,200);
		strokeWeight(1);
		fill(0,0,0);
		rect(-3,8,4,12);
		ellipse(-4,0,3,3);
		ellipse(0,-3,3,3);
		ellipse(3,1,3,3);
		fill(200,200,200);
// 		stroke(0,0,0)
		rect(-3,4,4,4);
		pop();
	} else if (currentTool === 'Circle Select'){
		let r;
		if (noneCursor){
			r = tools['Circle Select'].numOptions['Radius'];	
		} else {
			r = 15;
		}
		noFill();
		stroke(200,200,200);
		strokeWeight(1);
		ellipse(mX,mY,2*r,2*r);
		line(mX-r/5,mY,mX+r/5,mY);
		line(mX,mY-r/5,mX,mY+r/5);
		stroke(0,0,0,150);
		ellipse(mX,mY,2*r+2,2*r+2);
		line(mX-r/5,mY-1,mX+r/5,mY-1);
		line(mX-1,mY-r/5,mX-1,mY+r/5);
	} else if (currentTool === 'Circle Deselect'){
		let r;
		if (noneCursor){
			r = tools['Circle Deselect'].numOptions['Radius'];	
		} else {
			r = 15;
		}
		noFill();
		stroke(200,200,200);
		strokeWeight(1);
		ellipse(mX,mY,2*r,2*r);
		line(mX-r/5,mY,mX+r/5,mY);
		stroke(0,0,0,150);
		ellipse(mX,mY,2*r+2,2*r+2);
		line(mX-r/5,mY-1,mX+r/5,mY-1);
	}  else if (currentTool === 'Colour Fill'){
		strokeWeight(1);
		push();
		translate(mX-5,mY);
		rotate(15);
		noStroke();
		fill(tools['Colour Fill'].col[0],tools['Colour Fill'].col[1],tools['Colour Fill'].col[2],tools['Colour Fill'].col[3]);
		rect(-9,-2,18,12);
		triangle(-9,-2,9,-2,9,-6);
		stroke(200,200,200);
		arc(0,10,18,7,0,180);
		noFill();
		line(-9,-12,-9,10);
		line(9,-12,9,10);
		ellipse(0,-10,19,4);
		stroke(20,20,20);
		arc(0,11,20,8,10,170);
		line(-10,-11,-10,11);
		line(10,-11,10,11);
		ellipse(0,-11,20,5);
		pop();
		push();
		noFill();
		translate(mX-5,mY-13);
		rotate(-30);
		stroke(200,200,200);
		arc(1,5,5,32,160,355);
		stroke(20,20,20);
		arc(1,5,7,36,160,355);
		pop();
	}  else if (currentTool === 'Colour Stroke'){
		let ps = [
			{x:11,y:5},
			{x:10,y:9},
			{x:6,y:10},
			{x:3,y:7},
			{x:-1,y:8},
			{x:-2,y:12},
			{x:-6,y:13},
			{x:-8,y:9},
			{x:-8,y:5},
			{x:-10,y:3},
			{x:-14,y:2},
			{x:-15,y:-3},
			{x:-10,y:-6},
			{x:-6,y:-4},
			{x:-3,y:-5},
			{x:-2,y:-10},
			{x:2,y:-12},
			{x:4,y:-8},
			{x:3,y:-5},
			{x:10,y:-6},
			{x:12,y:-4},
			{x:11,y:-1},
			{x:6,y:1}];
		noFill();
		push();
		translate(mX,mY);
		strokeWeight(3);
		strokeWeight(1);
		stroke(tools['Colour Stroke'].col[0],tools['Colour Stroke'].col[1],tools['Colour Stroke'].col[2],tools['Colour Stroke'].col[3]);
		beginShape();
		curveVertex(ps[0].x,ps[0].y);
		for (var i=0; i<ps.length; i+=1){
			curveVertex(ps[i].x,ps[i].y);
		}
		curveVertex(ps[0].x,ps[0].y);
		curveVertex(ps[0].x,ps[0].y);
		endShape();
		pop();
	}   else if (currentTool === 'Revert Area'){
		noFill();
		stroke(200,200,200);
		arc(mX,mY,18,18,-90,160);
		stroke(20,20,20);
		arc(mX,mY,20,20,-90,160);
		fill(200,200,200);
		triangle(mX+1,mY-2,mX-1,mY-15,mX-8,mY-6);
	}
}

function determineAreaStroke(area){
	if (colAreaMethod===1){
		colHSB = areaHue[(area-1)%areaHue.length];
		timeSec = millis()/1000;
		if ((int(timeSec)%4)%2){
			colRGB = HSB2RGB([colHSB[0],colHSB[1]*2*abs(0.5-(timeSec-int(timeSec))),colHSB[2]]);
		} else {
			colRGB = HSB2RGB([colHSB[0],colHSB[1],colHSB[2]*2*abs(0.5-(timeSec-int(timeSec)))]);
		}
		colRGB.push(255);
	} else if (colAreaMethod===2){
		colHSB = areaHue[(area-1)%areaHue.length];
		timeSec = millis()/1000;
		if (img1.colFlash==='w'){
			colRGB = HSB2RGB([colHSB[0],colHSB[1]*Math.pow(cos(90*(timeSec)),2),colHSB[2]]);
		} else if (img1.colFlash==='b'){
			colRGB = HSB2RGB([colHSB[0],colHSB[1],colHSB[2]*Math.pow(cos(90*(timeSec)),2)]);
		}
		colRGB.push(200);
	}  else if (colAreaMethod===3){
		colHSB = areaHue[(area-1)%areaHue.length];
		timeSec = millis()/1000;
		if (int(timeSec)%4===0 || int(timeSec)%4===1){
			colRGB = HSB2RGB([colHSB[0],colHSB[1]*Math.pow(cos(90*(timeSec)),2),colHSB[2]]);
		} else {
			colRGB = HSB2RGB([colHSB[0],colHSB[1],colHSB[2]*Math.pow(cos(90*(timeSec)),2)]);
		}
		colRGB.push(200);
	} else if (colAreaMethod===4){
		if ((int(millis()/1000)%4)%2===0){
			colRGB = areaCols[(area-1)%areaCols.length];
		} else if (int(millis()/1000)%4===1){
			colRGB = [255,255,255];
		} else if (int(millis()/1000)%4===3){
			colRGB = [0,0,0];
		}
		colRGB.push(255);
	} else if (colAreaMethod===5){
		colRGB = areaCols[(area-1)%areaCols.length];
		colRGB.push(255);
	}
}

class img {
	constructor (IMG,x,y,w,h){
		this.IMG = IMG;
		this.history = 0;
		this.x = x;
		this.y = y;
		this.w = int(w);
		if (!w){
			this.w = IMG.width;
		} else {
			this.h = IMG.height;
		}
		if (!h){
			this.h = int(this.w*IMG.height/IMG.width);
		} else {
			this.h = int(h);
		}
		this.IMG.resize(this.w,this.h);
		this.modImgs = [];
		this.modImgs.push(createImage(this.w,this.h));
		this.modImgs[0].copy(this.IMG, 0, 0, this.w, this.h, 0, 0, this.w, this.h);
		this.areas = [[]];
		this.areaNum = 2;
		this.depthForGraphic;
		this.maxDepthForGraphic=1;
		this.colFlash;
		this.currentPxEdge;
		this.px = [];
		for (var i=0; i<this.w*this.h; i+=1){this.px.push(0);}
		this.pxArea = [];
		for (var i=0; i<this.w*this.h; i+=1){this.pxArea.push(0);}
		this.transparentBack = createGraphics(this.w,this.h);
		this.buildTransparencyGrid();
		this.colFlash = this.determineSelectBorderFlash();
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
	determineSelectBorderFlash(){
		this.IMG.loadPixels();
		let total = 0;
		for (var i=0; 4*i<this.IMG.pixels.length; i+=1){
			total += this.IMG.pixels[4*i] + this.IMG.pixels[4*i+1] + this.IMG.pixels[4*i+2];
		}
		let result = total/(3/4 * this.IMG.pixels.length);
		if (result>255/2){
			return 'b';
		} else {
			return 'w';
		}
	}
	
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
		
	drawArea(area) {
		if (area < this.areaNum-1){
// 			image(this.areas[area],this.x,this.y,this.w,this.h);
			this.drawMod();
			if (area){
				if (this.areas[area].length){
					determineAreaStroke(area);
					stroke(colRGB[0],colRGB[1],colRGB[2],colRGB[3]);
					for (var pix=0; pix<this.areas[area].length; pix+=1){
						point(this.x-this.w/2+this.areas[area][pix]%this.w,this.y-this.h/2+int(this.areas[area][pix]/this.w));
					}
				}
				stroke(areaCols[area-1][0],areaCols[area-1][1],areaCols[area-1][2],100);
			} else if (activeArea && activeArea<this.areaNum-1){
				if (this.areaNum>2){
					for (var l=1; l<this.areaNum-1; l+=1){
						determineAreaStroke(l);
						stroke(colRGB[0],colRGB[1],colRGB[2],colRGB[3]);
						for (var pix=0; pix<this.areas[l].length; pix+=1){
							point(this.x-this.w/2+this.areas[l][pix]%this.w,this.y-this.h/2+int(this.areas[l][pix]/this.w));
						}
					}
				}
				stroke(areaCols[activeArea-1][0],areaCols[activeArea-1][1],areaCols[activeArea-1][2],100);
			} else {
				stroke(255,255,255,30);
			}
		} else {
			if (area === this.areaNum-1){
				this.drawMod();
			} else {
				this.drawOriginal();
			}
			stroke(255,255,255,30);
		}
		strokeWeight(1);
		line(this.x-this.w/2-4,this.y-this.h/2-4,this.x+this.w/2+4,this.y-this.h/2-4);
		line(this.x+this.w/2+4,this.y-this.h/2-4,this.x+this.w/2+4,this.y+this.h/2+4);
		line(this.x+this.w/2+4,this.y+this.h/2+4,this.x-this.w/2-4,this.y+this.h/2+4);
		line(this.x-this.w/2-4,this.y+this.h/2+4,this.x-this.w/2-4,this.y-this.h/2-4);
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
	
	modifyImage(){
		this.modImgs.length = this.history+1;
	}
	
	updateArea(area){
		if (!area){
			area = activeArea;
		}
		this.modImgs[this.history].loadPixels();
/*
		print('history:' + this.history);
		print('modImgs R:' + this.modImgs[this.history].pixels[0]);
		print('modImgs G:' + this.modImgs[this.history].pixels[1]);
		print('modImgs B:' + this.modImgs[this.history].pixels[2]);
		print('modImgs A:' + this.modImgs[this.history].pixels[3]);
*/
		
		this.areas[area] = [];
		
		for (var pix=0; pix<this.pxArea.length; pix+=1){
/*
			if (this.px[pix] && (!area || this.pxArea[pix]===area)){
				colHSB = areaHue[(this.pxArea[pix]-1)%areaHue.length];
				if (this.px[pix]===1){
					this.colourPix(this.areas[area],pix,HSB2RGB([colHSB[0],3*(colHSB[1])/4,colHSB[2]]));
				} else {
					this.colourPix(this.areas[area],pix,HSB2RGB([colHSB[0],3*(colHSB[1])/4,(colHSB[2])*(1-this.px[pix]/this.maxDepthForGraphic)]));
				}
			}
*/
			if (this.pxArea[pix]===area){

				if (pix%this.w===1){
					this.areas[area].push(pix-1);
				}
				if (pix%this.w===this.w-2){
					this.areas[area].push(pix+1);
				}
				if (this.pxArea[pix-this.w]!==area || this.pxArea[pix+this.w]!==area || this.pxArea[pix-1]!==area || this.pxArea[pix+1]!==area){
					this.areas[area].push(pix);
				}
			}
		}
/*
		print('area:' + area);
		print('areas R:' + this.areas[area].pixels[0]);
		print('areas G:' + this.areas[area].pixels[1]);
		print('areas B:' + this.areas[area].pixels[2]);
		print('areas A:' + this.areas[area].pixels[3]);
		print('\n')
*/
	}
	
	newPixSelect(pix){
		this.px[pix] = this.depthForGraphic+1;
		this.pxArea[pix] = activeArea;
		this.currentPxEdge[this.depthForGraphic].push(pix);
	}
	
	testPass(pix,c) {
		return abs(this.modImgs[this.history].pixels[4*(pix)]-c[0])+
			   abs(this.modImgs[this.history].pixels[4*(pix)+1]-c[1])+
			   abs(this.modImgs[this.history].pixels[4*(pix)+2]-c[2])<=3*tools['Magic Wand'].numOptions['Tolerance'];
	}
	
	imageHover(){
		if (mouseX>this.x-int(this.w/2) && mouseX<this.x+int(this.w/2) && mouseY>this.y-int(this.h/2) && mouseY<this.y+int(this.h/2)){
			return true;
		} else {
			return false;
		}
	}
	
	imageRun(){
		if (this.imageHover()){
			toolCursors(mouseX,mouseY,true);
		}
	}
	
	convertMousePosToPix(mX,mY){
		return (mX-this.x-int(this.w/2))+(mY-this.y+int(this.h/2))*int(this.w);
	}

	newMagicWand(mX,mY) {
		if (this.imageHover()){
			let index = this.convertMousePosToPix(mX,mY);
			if (this.px[index]===0){
				if ((this.areaNum===2 || chosenArea>this.areaNum-2) && this.areaNum<=9){
					this.areas.push([]);
					if (chosenArea===this.areaNum){chosenArea -= 1;}
					this.areaNum += 1;
					activeArea = this.areaNum-2;
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
				this.pxArea[index] = activeArea;
				while (this.currentPxEdge[this.depthForGraphic-1].length) {
					this.currentPxEdge.push([]);
					for (var i=0; i<this.currentPxEdge[this.depthForGraphic-1].length; i+=1){
						var pix = this.currentPxEdge[this.depthForGraphic-1][i];
						if (this.px[pix]===this.depthForGraphic && this.pxArea[pix]===activeArea){
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
				for (var pix=0; pix<this.pxArea.length; pix+=1){
					if (this.pxArea[pix] !== activeArea){
						leftPix=0;
						rightPix=0;
						upPix=0;
						downPix=0;
						if (this.pxArea[pix-1] === activeArea){
							leftPix = 1;
						}
						if (this.pxArea[pix+1] === activeArea){
							rightPix = 1;
						}
						if (this.pxArea[pix-this.w] === activeArea){
							upPix = 1;
						}
						if (this.pxArea[pix+this.w] === activeArea){
							downPix = 1;
						}
						if (leftPix + rightPix + upPix + downPix >=3){
							this.pxArea[pix] = activeArea;
							this.px[pix] = 1;
						}
					}
				}
				this.updateArea(chosenArea);
			}
		}
	}
	
	newCircleSelect(mX,mY) {
		if (this.imageHover()){
			if ((this.areaNum===2 || chosenArea>this.areaNum-2) && this.areaNum<=9){
				this.areas.push([]);
				if (chosenArea===this.areaNum){chosenArea -= 1;}
				this.areaNum += 1;
				activeArea = this.areaNum-2;
			}
			let index = this.convertMousePosToPix(mX,mY);
			let anySelect = false;
			let dSquare;
// 			this.areas[chosenArea].loadPixels();
			
			colHSB = areaHue[(activeArea-1)%areaHue.length];
			let colRGBSelect = HSB2RGB([colHSB[0],3*(colHSB[1])/4,colHSB[2]]);
			
			if (index+tools['Circle Select'].numOptions['Radius']*this.w<this.px.length){maxPix = index+tools['Circle Select'].numOptions['Radius']*this.w;} else {maxPix = this.px.length;}
			if (index-tools['Circle Select'].numOptions['Radius']*this.w>0){minPix = index-tools['Circle Select'].numOptions['Radius']*this.w;} else {minPix = 0;}
			
			for (var pix=minPix; pix<maxPix; pix+=1){
				if (pix>this.px.length-1){
					break;	
				} else{
					dSquare = Math.pow(pix%this.w - index%this.w,2) + Math.pow(int(pix/this.w)-int(index/this.w),2);
					if (!this.pxArea[pix] && dSquare <= tools['Circle Select'].numOptions['Radius']*tools['Circle Select'].numOptions['Radius']){
						this.pxArea[pix]=activeArea;
						this.px[pix] = 1;
						anySelect = true;
	// 					this.colourPix(this.areas[chosenArea],pix,colRGBSelect);
					}
				}
			}
// 			this.areas[chosenArea].updatePixels();
			if (anySelect){
				this.updateArea(chosenArea);
			}
		}
	}
	
	newCircleDeselect(mX,mY) {
		if (this.imageHover() && this.areaNum>1){
			let index = this.convertMousePosToPix(mX,mY);
			let dSquare;
			let anySelect = false;
			
			this.modImgs[this.history].loadPixels();
// 			this.areas[chosenArea].loadPixels();

			if (index+tools['Circle Deselect'].numOptions['Radius']*this.w<this.px.length){maxPix = index+tools['Circle Deselect'].numOptions['Radius']*this.w;} else {maxPix = this.px.length;}
			if (index-tools['Circle Deselect'].numOptions['Radius']*this.w>0){minPix = index-tools['Circle Deselect'].numOptions['Radius']*this.w;} else {minPix = 0;}
			
			for (var pix=minPix; pix<maxPix; pix+=1){
				dSquare = Math.pow(pix%this.w - index%this.w,2) + Math.pow(int(pix/this.w)-int(index/this.w),2);
				if (this.pxArea[pix]===activeArea && dSquare <= tools['Circle Deselect'].numOptions['Radius']*tools['Circle Deselect'].numOptions['Radius']){
					this.pxArea[pix] = 0;
					this.px[pix] = 0;
					anySelect = true;
					
// 					this.areas[chosenArea].pixels[4*(pix)] = this.modImgs[this.history].pixels[4*(pix)];
// 					this.areas[chosenArea].pixels[4*(pix)+1] = this.modImgs[this.history].pixels[4*(pix)+1];
// 					this.areas[chosenArea].pixels[4*(pix)+2] = this.modImgs[this.history].pixels[4*(pix)+2];
// 					this.areas[chosenArea].pixels[4*(pix)+3] = this.modImgs[this.history].pixels[4*(pix)+3];
				}
			}
// 			this.areas[chosenArea].updatePixels();
			if (anySelect){
				this.updateArea(chosenArea);
			}
		}
	}
	
	areaColourFill(col,area){
		this.modifyImage();
		if (this.history===this.modImgs.length-1){
			this.modImgs.push(createImage(this.w,this.h));
			this.history += 1;
			this.modImgs[this.history].copy(this.modImgs[this.history-1], 0, 0, this.w, this.h, 0, 0, this.w, this.h);
		}
		this.modImgs[this.history].loadPixels();
		for (var pix=0; pix<this.px.length; pix+=1){
			if (this.pxArea[pix]===area){
				this.colourPix(this.modImgs[this.history],pix,col);
			}
		}
		this.modImgs[this.history].updatePixels();
		chosenArea = this.areaNum-1;
	}
	
	areaColourStroke(col,area){
		this.modifyImage();
		if (this.history===this.modImgs.length-1){
			this.modImgs.push(createImage(this.w,this.h));
			this.history += 1;
			this.modImgs[this.history].copy(this.modImgs[this.history-1], 0, 0, this.w, this.h, 0, 0, this.w, this.h);
		}
		this.modImgs[this.history].loadPixels();
		for (var pix=0; pix<this.areas[area].length; pix+=1){
			this.colourPix(this.modImgs[this.history],this.areas[area][pix],col);
		}
		this.modImgs[this.history].updatePixels();
		chosenArea = this.areaNum-1;
	}
	
	revertAreaToOriginal(select){
		this.modifyImage();
		if (this.history===this.modImgs.length-1){
			this.modImgs.push(createImage(this.w,this.h));
			this.history += 1;
			this.modImgs[this.history].copy(this.modImgs[this.history-1], 0, 0, this.w, this.h, 0, 0, this.w, this.h);
		}
		this.modImgs[this.history].loadPixels();
		this.IMG.loadPixels();
		for (var pix=0; pix<this.px.length; pix+=1){
			if (this.pxArea[pix]===select){
				this.colourPix(this.modImgs[this.history],pix,[this.IMG.pixels[4*pix],this.IMG.pixels[4*pix+1],this.IMG.pixels[4*pix+2],this.IMG.pixels[4*pix+3]]);
			}
		}
		this.modImgs[this.history].updatePixels();
		chosenArea = this.areaNum-1;
	}
	
	clearArea(area){
		this.areas[area] = [];
		for (var pix=0; pix<this.px.length; pix+=1){
			if (this.pxArea[pix]===area){
				this.pxArea[pix] = 0;
				this.px[pix] = 0;
			}
		}
	}
	
	undo(){
		if (this.history){
			this.history -= 1;
			this.updateArea(chosenArea);
		}
	}
	
	redo(){
		if (this.history<this.modImgs.length-1){
			this.history += 1;
			this.updateArea(chosenArea);
		}
	}
}

class tool {
	constructor (name, id, numberOptions, colourOption){
		this.name = name;
		this.id = id;
		this.numOptions = numberOptions;
		this.colOption = colourOption;
		if (colourOption){
			this.col = [135, 205, 212];
			this.colHover = false;
		}
	}
}

/*
class toolOption {
	constructor (name, id, numberOptions, colourOption, toolCursor){
		this.name = name;
		this.numOptions = numberOptions;
		this.colOption = colourOption;
		if (colourOption){
			this.col = [135, 205, 212];
		}
		this.toolCursor = toolCursor;
	}
}
*/

function selectionMap(){
	noStroke();
	fill(themeColours[2]);
	if (H<800){
		sidebarTopRHS = H/8;
		sidebarWordSeperationRHS = H/20;
	} else {
		sidebarTopRHS = 100;
		sidebarWordSeperationRHS = 40;
	}
	if (W<1300){
		sidebarWidthRHS = 220*W/1300;
	} else {
		sidebarWidthRHS = 220;
	}
	rect(W-sidebarWidthRHS,0,sidebarWidthRHS,H);
	strokeWeight(1);
	fill(255,255,255,180);
	textSize(0.1*sidebarTopRHS+8*sidebarWidthRHS/220);
	textAlign(CENTER,BASELINE);
	text('Selection Map',W-sidebarWidthRHS/2,sidebarTopRHS);
	sidebarWordWidthRHS = W-sidebarWidthRHS/2 + textWidth('Selection Map')/2;
	textAlign(RIGHT,CENTER);
	stroke(255,255,255,50);
	line(sidebarWordWidthRHS,sidebarTopRHS+7,W-sidebarWidthRHS+(W-sidebarWordWidthRHS),sidebarTopRHS+7);
	textSize(0.2*sidebarWordSeperationRHS+8*sidebarWidthRHS/220);
	for (var i=0; i<img1.areaNum+1; i+=1){
		if (!i){
			if (mouseX<sidebarWordWidthRHS && mouseX>W-sidebarWidthRHS+(W-sidebarWordWidthRHS) && mouseY>2* sidebarTopRHS+sidebarWordSeperationRHS*(i-1)-sidebarWordSeperationRHS/5 && mouseY<2* sidebarTopRHS+sidebarWordSeperationRHS*(i)-sidebarWordSeperationRHS/5){
				hoverArea = 0;
				cursorType = 'pointer';
			}
		} else if (i<img1.areaNum-1) {
			if (mouseX<sidebarWordWidthRHS && mouseX>W-sidebarWidthRHS+(W-sidebarWordWidthRHS) && mouseY>2* sidebarTopRHS+sidebarWordSeperationRHS*(i-1)+sidebarWordSeperationRHS/5 && mouseY<2* sidebarTopRHS+sidebarWordSeperationRHS*(i)-sidebarWordSeperationRHS/5){
				hoverArea = i;
				cursorType = 'pointer';
			}
		} else if (i===img1.areaNum-1){
			if (mouseX<W && mouseX>W-sidebarWidthRHS && mouseY>H-2*sidebarTopRHS && mouseY<H-1.5*sidebarTopRHS){//+sidebarWordSeperationRHS/5
				hoverArea = i;
				cursorType = 'pointer';
			}
		} else if (i===img1.areaNum){
			if (mouseX<W && mouseX>W-sidebarWidthRHS && mouseY>H-1.5*sidebarTopRHS && mouseY<H-1*sidebarTopRHS){//+sidebarWordSeperationRHS/5
				hoverArea = i;
				cursorType = 'pointer';
			}
		}
	}
	for (var i=0; i<img1.areaNum+1; i+=1){
		if (i===chosenArea){
			fill(255,255,255,220);
		} else {
			if (i===hoverArea){
				fill(255,255,255,190);
			} else {
				fill(255,255,255,130);
			}
		}
		
		noStroke();
		if (!i){
			noStroke();
			text('Area    ' + str(i),sidebarWordWidthRHS,2* sidebarTopRHS-20-sidebarWordSeperationRHS/2+sidebarWordSeperationRHS*i);
			fill(255,255,255,140);
			textSize(0.7*(0.2*sidebarWordSeperationRHS+8*sidebarWidthRHS/220));
			text('[ Unselected ]',sidebarWordWidthRHS,2* sidebarTopRHS-sidebarWordSeperationRHS/2+sidebarWordSeperationRHS*i);
			textSize(0.2*sidebarWordSeperationRHS+8*sidebarWidthRHS/220);
			stroke(255,255,255,140);
			noFill();
			ellipse(W-0.65*sidebarWidthRHS,2* sidebarTopRHS-sidebarWordSeperationRHS/2+sidebarWordSeperationRHS*i-10,10,10);
			if (activeArea){
				if (activeArea===img1.areaNum && img1.areaNum>1){
					fill(areaCols[(activeArea-2)%areaCols.length][0],areaCols[(activeArea-2)%areaCols.length][1],areaCols[(activeArea-2)%areaCols.length][2],100);
				} else {
					fill(areaCols[(activeArea-1)%areaCols.length][0],areaCols[(activeArea-1)%areaCols.length][1],areaCols[(activeArea-1)%areaCols.length][2],100);
				}
				noStroke();
				ellipse(W-0.75*sidebarWidthRHS,2*sidebarTopRHS-sidebarWordSeperationRHS/2+sidebarWordSeperationRHS*i-10,10,10);
			}
		} else if (i<img1.areaNum-1) {
			noStroke();
			text('Area   ' + str(i),sidebarWordWidthRHS,2*sidebarTopRHS-sidebarWordSeperationRHS/2+sidebarWordSeperationRHS*i);
			stroke(255,255,255,50);
			line(sidebarWordWidthRHS-20,2*sidebarTopRHS+sidebarWordSeperationRHS*(i-1),sidebarWordWidthRHS,2*sidebarTopRHS+sidebarWordSeperationRHS*(i-1));
			fill(areaCols[(i-1)%areaCols.length][0],areaCols[(i-1)%areaCols.length][1],areaCols[(i-1)%areaCols.length][2],150);
			noStroke();
			ellipse(W-0.65*sidebarWidthRHS,2*sidebarTopRHS-sidebarWordSeperationRHS/2+sidebarWordSeperationRHS*i,10,10);
		} else if (i===img1.areaNum-1){
			stroke(255,255,255,20);
			line(W-sidebarWidthRHS+10,H-2*sidebarTopRHS,W-10,H-2*sidebarTopRHS);
			noStroke();
			textAlign(CENTER,CENTER);
			text('Edited Image',W-sidebarWidthRHS/2,H-1.75*sidebarTopRHS);
			stroke(255,255,255,50);
		}  else if (i===img1.areaNum){
			stroke(255,255,255,20);
			line(W-sidebarWidthRHS+10,H-1.5*sidebarTopRHS,W-10,H-1.5*sidebarTopRHS);
			noStroke();
			textAlign(CENTER,CENTER);
			text('Original Image',W-sidebarWidthRHS/2,H-1.25*sidebarTopRHS);
			stroke(255,255,255,50);
		}

	}
	
	stroke(255,255,255,20);
	line(W-sidebarWidthRHS+10,H-1*sidebarTopRHS,W-10,H-1*sidebarTopRHS);
	stroke(255,255,255,20);
	line(W-sidebarWidthRHS,0,W-sidebarWidthRHS,H);
	
	if (img1.areaNum<=10){
		stroke(255,255,255,170);
	} else {
		stroke(255,255,255,75);
	}
	line(W-sidebarWidthRHS/2-8,H-0.5*sidebarTopRHS,W-sidebarWidthRHS/2+8,H-0.5*sidebarTopRHS);
	line(W-sidebarWidthRHS/2,H-0.5*sidebarTopRHS-8,W-sidebarWidthRHS/2,H-0.5*sidebarTopRHS+8);
	noFill();
	stroke(255,255,255,100);
	ellipse(W-sidebarWidthRHS/2,H-0.5*sidebarTopRHS,40,40);
	
	if (dist(mouseX,mouseY,W-sidebarWidthRHS/2,H-0.5*sidebarTopRHS)<20){
		cursorType = 'pointer';
	}
}

function toolsButton(){
// 	let toolButtonWidth = 80;
	toolButtonHeight = int(7*toolBarHeight/12);
	toolButtonWidth = toolButtonHeight*1.5;
	if (!toolView){
		strokeWeight(1);
		stroke(themeColours[0].levels[0],themeColours[0].levels[1],themeColours[0].levels[2],100);
		rect(toolTabPadding,(toolBarHeight-toolButtonHeight)/2,toolButtonWidth,toolButtonHeight,3);
		fill(255,255,255,150);
		textSize(12);
		noStroke();
		text('MORE TOOLS',toolTabPadding+toolButtonWidth/2,toolBarHeight/2+toolButtonHeight/4+2);
		stroke(themeColours[0].levels[0],themeColours[0].levels[1],themeColours[0].levels[2],100);
		stroke(255,255,255,150)
		fill(255,255,255,100);
		noFill();
		push();
		translate(toolTabPadding+toolButtonWidth/2+2,toolBarHeight/2-toolButtonHeight/4-3);
		rotate(10);
		rect(-1,1,4,22);
		rotate(-5);
		rect(3,-3,2,5);
		rect(6,-4,7,8);
		rotate(-10);
		rect(-4,-2,7,4);
		rotate(-15);
		rect(-10,-2,6,3);
		rotate(-15);
		rect(-12,-4,3,2);
		pop();
	} else {
		strokeWeight(1);
		stroke(255,255,255,100);
// 		stroke(themeColours[0].levels[0],themeColours[0].levels[1],themeColours[0].levels[2],100);
// 		fill(themeColours[0].levels[0],themeColours[0].levels[1],themeColours[0].levels[2],50);
		noFill();
		rect(toolTabPadding,(toolBarHeight-toolButtonHeight)/2,toolButtonWidth,toolButtonHeight,3);
		fill(255,255,255,150);
		textSize(12);
		noStroke();
		text('MORE TOOLS',toolTabPadding+toolButtonWidth/2,toolBarHeight/2+toolButtonHeight/4+2);
		fill(255,255,255,150);
		push();
		noStroke();
		translate(toolTabPadding+toolButtonWidth/2+2,toolBarHeight/2-toolButtonHeight/4-3);
		rotate(10);
		rect(-1,1,4,22);
		rotate(-5);
		rect(3,-3,2,5);
		rect(6,-4,7,8);
		rotate(-10);
		rect(-4,-2,7,4);
		rotate(-15);
		rect(-10,-2,6,3);
		rotate(-15);
		rect(-12,-4,3,2);
		pop();
	}
	if (mouseX>toolTabPadding && mouseX<toolTabPadding+toolButtonWidth && mouseY>(toolBarHeight-toolButtonHeight)/2 && mouseY<(toolBarHeight+toolButtonHeight)/2){
		cursorType = 'pointer';
		toolButtonHover = true;
	}
}

function toolBar(){
	
	if (W<1300){
		toolTabPadding = (padding)*W/1300;
	} else {
		toolTabPadding = padding;
	}
	noStroke();
	noFill();
	fill(themeColours[2]);
	rect(0,0,W,toolBarHeight);
	stroke(255,255,255,20);
	line(0,toolBarHeight,W-sidebarWidthRHS,toolBarHeight);
	toolsButton();
	toolTabWidth = int((W-toolTabPadding-toolButtonWidth-sidebarWidthRHS-2*toolTabPadding)/Object.keys(tools).length);
	if (toolView){
		if (toolTabWidth<120){
			textSize(toolTabWidth * 0.12);
		} else {
			textSize(14);
		}
		textAlign(CENTER,CENTER);
		stroke(255,255,255,50);
		line(toolTabPadding+toolButtonWidth+toolTabPadding,toolBarHeight/2-10,toolTabPadding+toolButtonWidth+toolTabPadding,toolBarHeight/2+10);
		toolHover = 0;
		for (var t in tools){
			if (mouseX>toolTabPadding+toolButtonWidth+toolTabPadding+tools[t].id*toolTabWidth && mouseX<toolTabPadding+toolButtonWidth+toolTabPadding+(tools[t].id+1)*toolTabWidth && mouseY>toolBarHeight/2-10 && mouseY<toolBarHeight/2+10){
				cursorType = 'pointer';
				toolHover = tools[t].name;
			}
			if (currentTool===t){
				fill(255,255,255,180);
			} else if (toolHover===t) {
				fill(themeColours[0].levels[0],themeColours[0].levels[1],themeColours[0].levels[2],180);
			} else {
				fill(255,255,255,100);
			}
			noStroke();
			text(t,toolTabPadding+toolButtonWidth+toolTabPadding+(tools[t].id+0.5)*toolTabWidth,toolBarHeight/2);
			stroke(255,255,255,50);
			line(toolTabPadding+toolButtonWidth+toolTabPadding+(tools[t].id+1)*toolTabWidth,toolBarHeight/2-10,toolTabPadding+toolButtonWidth+toolTabPadding+(tools[t].id+1)*toolTabWidth,toolBarHeight/2+10);
		}
	} else {
		noStroke();
		fill(255,255,255,180);
		textSize(18);
		textAlign(LEFT);
		text(currentTool,toolTabPadding+toolButtonWidth+toolTabPadding,toolBarHeight/2);
		fill(255,255,255,100);
		if (currentTool==='Magic Wand'){
			toolCursors(toolTabPadding+toolButtonWidth+toolTabPadding+textWidth(currentTool)+toolTabPadding,toolBarHeight/2-10);
		} else {
			toolCursors(toolTabPadding+toolButtonWidth+toolTabPadding+textWidth(currentTool)+toolTabPadding,toolBarHeight/2);
		}
		stroke(255,255,255,50);
		let dashLineX = toolTabPadding+toolButtonWidth+toolTabPadding+textWidth(currentTool)+2*toolTabPadding;
		for (var i=0; i<10; i+=1){
			line(dashLineX,2*i*toolBarHeight/20,dashLineX,(2*i+1)*toolBarHeight/20);
		}
		
		noStroke();
		fill(255,255,255,150);
		textSize(14);
		let cumulX = dashLineX + toolTabPadding;
		for (var nO in tools[currentTool].numOptions){
			text(nO+':  '+str(tools[currentTool].numOptions[nO]),cumulX,toolBarHeight/2);
			cumulX += textWidth(nO+':  '+str(tools[currentTool].numOptions[nO])) + toolTabPadding;
		}	
		
		if (tools[currentTool].colOption){
			tools[currentTool].colHover = false;
			fill(255,255,255,150);
			textSize(12);
			if (tools[currentTool].col.length>3 && tools[currentTool].col[3]!==255){
				let colTXT = 'RGBA:  ' + str(tools[currentTool].col[0]) +', '+ str(tools[currentTool].col[1]) +', '+ str(tools[currentTool].col[2]) +', '+ str(tools[currentTool].col[3]);
				text(colTXT,cumulX,toolBarHeight/2);
				cumulX += textWidth(colTXT) + toolTabPadding/2;
			} else {
				let colTXT = 'RGB:  ' + str(tools[currentTool].col[0]) +', '+ str(tools[currentTool].col[1]) +', '+ str(tools[currentTool].col[2]);
				text(colTXT,cumulX,toolBarHeight/2);
				cumulX += textWidth(colTXT) + toolTabPadding/2;
			}
			noFill();
			stroke(255,255,255,50);
			rect(cumulX,toolBarHeight/2-9,15,15);
			noStroke();
			fill(tools[currentTool].col[0],tools[currentTool].col[1],tools[currentTool].col[2]);
			rect(cumulX+3,toolBarHeight/2-6,10,10);
			if (mouseX>cumulX-2 && mouseX<cumulX+15+2 && mouseY>toolBarHeight/2-12 && mouseY<toolBarHeight/2+7){
				cursorType = 'pointer';
				tools[currentTool].colHover = true;
			}
		}
/*
		if (currentTool==='Magic Wand'){
			text('Tolerance:  ' + str(tools['Magic Wand'].numOptions['Tolerance']),15*W/80,17*H/20)
		} else if (currentTool==='Circle Select'){
			fill(255,255,255,100);
			textSize(12);
			text('Circle Select Size:  ' + str(tools['Circle Select'].numOptions['Radius']),25*W/80,17*H/20)
		} else if (currentTool==='Circle Deselect'){
			fill(255,255,255,100);
			textSize(12);
			text('Circle Deselect Size:  ' + str(tools['Circle Deselect'].numOptions['Radius']),35*W/80,17*H/20)
		} else if (currentTool==='Colour Fill'){
			fill(255,255,255,100);
			textSize(12);
			if (tools['Colour Fill'].col.length>3 && tools['Colour Fill'].col[3]!==255){
				text('RGBA:  ' + str(tools['Colour Fill'].col[0]) +', '+ str(tools['Colour Fill'].col[1]) +', '+ str(tools['Colour Fill'].col[2]) +', '+ str(tools['Colour Fill'].col[3]),45*W/80,17*H/20)
			} else {
				text('RGB:  ' + str(tools['Colour Fill'].col[0]) +', '+ str(tools['Colour Fill'].col[1]) +', '+ str(tools['Colour Fill'].col[2]),45*W/80,17*H/20)
			}
			noFill();
			stroke(255,255,255,50);
			rect(45*W/80-8,17*H/20+20-3,15,15);
			noStroke();
			fill(tools['Colour Fill'].col[0],tools['Colour Fill'].col[1],tools['Colour Fill'].col[2]);
			rect(45*W/80-5,17*H/20+20,10,10);
			if (mouseX>45*W/80-8 && mouseX<45*W/80+7 && mouseY>17*H/20+20-3 && mouseY<17*H/20+20+12){
				cursorType = 'pointer';
			}
		} else if (currentTool==='Colour Stroke'){
			fill(255,255,255,100);
			textSize(12);
			if (tools['Colour Stroke'].col.length>3 && tools['Colour Stroke'].col[3]!==255){
				text('RGBA:  ' + str(tools['Colour Stroke'].col[0]) +', '+ str(tools['Colour Stroke'].col[1]) +', '+ str(tools['Colour Stroke'].col[2]) +', '+ str(tools['Colour Stroke'].col[3]),55*W/80,17*H/20)
			} else {
				text('RGB:  ' + str(tools['Colour Stroke'].col[0]) +', '+ str(tools['Colour Stroke'].col[1]) +', '+ str(tools['Colour Stroke'].col[2]),55*W/80,17*H/20)
			}
			noFill();
			stroke(255,255,255,50);
			rect(55*W/80-8,17*H/20+20-3,15,15);
			noStroke();
			fill(tools['Colour Stroke'].col[0],tools['Colour Stroke'].col[1],tools['Colour Stroke'].col[2]);
			rect(55*W/80-5,17*H/20+20,10,10);
			if (mouseX>55*W/80-8 && mouseX<55*W/80+7 && mouseY>17*H/20+20-3 && mouseY<17*H/20+20+12){
				cursorType = 'pointer';
			}
		}
*/

	}
}

function draw(){
// 	if (activity){
		cursorType = 'default';
		updateScreen();
		img1.imageRun();
// 	}
	activity = false;
	cursor(cursorType);
}

function updateScreen(){
	hoverArea = -1;
	toolButtonHover = false;
	
	background(themeColours[1]);	
	img1.drawTransparencyGrid();
	img1.drawArea(chosenArea);
	toolBar();
	selectionMap();
}


function mouseMoved(){
	activity = true;
}

function mouseClicked(){
	activity = true;
	
	if (currentTool==='Magic Wand'){
		img1.newMagicWand(mouseX,mouseY);
	} else if (currentTool==='Circle Select'){
		img1.newCircleSelect(mouseX,mouseY);
	} else if (currentTool==='Circle Deselect'){
		img1.newCircleDeselect(mouseX,mouseY);
	}  else if (currentTool==='Colour Fill'){
		if (img1.imageHover()){
			img1.areaColourFill(tools['Colour Fill'].col,chosenArea);
		} else if (tools['Colour Fill'].colHover){
			tools['Colour Fill'].col = [int(prompt('Red (0-255):')),int(prompt('Green (0-255):')),int(prompt('Blue (0-255):')),int(prompt('Alpha (0-255):'))];
			for (var i=0; i<4; i+=1){
				if (!tools['Colour Fill'].col[i] && tools['Colour Fill'].col[i]!==0){
					tools['Colour Fill'].col[i] = 255;
				}
			}
		}
	}  else if (currentTool==='Colour Stroke'){
		if (img1.imageHover()){
			img1.areaColourStroke(tools['Colour Stroke'].col,chosenArea);
		} else if (tools['Colour Stroke'].colHover){
			tools['Colour Stroke'].col = [int(prompt('Red (0-255):')),int(prompt('Green (0-255):')),int(prompt('Blue (0-255):')),int(prompt('Alpha (0-255):'))];
			for (var i=0; i<4; i+=1){
				if (!tools['Colour Stroke'].col[i] && tools['Colour Stroke'].col[i]!==0){
					tools['Colour Stroke'].col[i] = 255;
				}
			}
		}
	} else if (currentTool === 'Revert Area'){
		if (img1.imageHover()){
			img1.revertAreaToOriginal(chosenArea);
		}
	}

	if (hoverArea>=0){
		chosenArea = hoverArea;
		if (hoverArea>0 && chosenArea<img1.areaNum-1){
			activeArea = hoverArea;
		}
		if (hoverArea<img1.areaNum-1){
			img1.updateArea(chosenArea);
		}
	}
	if (dist(mouseX,mouseY,W-sidebarWidthRHS/2,H-0.5*sidebarTopRHS)<20 && img1.areaNum<=10){
		img1.areas.push([]);
		img1.areaNum += 1;
		chosenArea = img1.areaNum-2;
		activeArea = img1.areaNum-2;
	}
	if (toolView && toolHover){
		currentTool = toolHover;
		toolView = false;
	}
	if (toolButtonHover){
		if (toolView){
			toolView = false;
		} else {
			toolView = true;
		}
	}
}

function mouseDragged(){
	activity = true;

	if (currentTool==='Magic Wand'){
		img1.newMagicWand(mouseX,mouseY);
	} else if (currentTool==='Circle Select'){
		img1.newCircleSelect(mouseX,mouseY);
	} else if (currentTool==='Circle Deselect'){
		img1.newCircleDeselect(mouseX,mouseY);
	}
}

function mouseWheel(event) {
	activity = true;
	
	if (currentTool==='Magic Wand' && (tools['Magic Wand'].numOptions['Tolerance']>0 || event.delta>0)){
		tools['Magic Wand'].numOptions['Tolerance'] += int(event.delta/20);
		if (tools['Magic Wand'].numOptions['Tolerance']<0){
			tools['Magic Wand'].numOptions['Tolerance'] = 0;
		}
	} else if (currentTool==='Circle Select' && (tools['Circle Select'].numOptions['Radius']>1 || event.delta>0)){
		tools['Circle Select'].numOptions['Radius'] += int(event.delta/20);
		if (tools['Circle Select'].numOptions['Radius']<1){
			tools['Circle Select'].numOptions['Radius'] = 1;
		}
	} else if (currentTool==='Circle Deselect' && (tools['Circle Deselect'].numOptions['Radius']>1 || event.delta>0)){
		tools['Circle Deselect'].numOptions['Radius'] += int(event.delta/20);
		if (tools['Circle Deselect'].numOptions['Radius']<1){
			tools['Circle Deselect'].numOptions['Radius'] = 1;
		}
	}
}

function keyTyped() {
	activity = true;
	
  if (keyIsDown(83)) {
    img1.modImgs[img1.history].save('tom_new', 'png');
  }
  if (keyIsDown(66)) {
  	img1.areaColourFill([0,0,0,255],chosenArea);
  }
  if (keyIsDown(67)) {
  	img1.areaColourFill([0,0,0,0],chosenArea);
  }
  if (keyIsDown(87)) {
  	img1.areaColourFill([255,255,255,255],chosenArea);
  }
  if (keyIsDown(32) && chosenArea>0 && chosenArea<img1.areaNum-1) {
  	img1.clearArea(chosenArea);
  }
  if (keyIsDown(85)) {
    img1.undo();
  }
  if (keyIsDown(82)) {
    img1.redo();
  }
  
  if (keyIsDown(187)) {
	if (currentTool==='Magic Wand'){
		tools['Magic Wand'].numOptions['Tolerance'] += 1;
	} else if (currentTool==='Circle Select'){
		tools['Circle Select'].numOptions['Radius'] += 1;
	} else if (currentTool==='Circle Deselect'){
		tools['Circle Deselect'].numOptions['Radius'] += 1;
	}
  }
  if (keyIsDown(189)) {
	if (currentTool==='Magic Wand' && tools['Magic Wand'].numOptions['Tolerance']>0){
		tools['Magic Wand'].numOptions['Tolerance'] -= 1;
	} else if (currentTool==='Circle Select' && tools['Circle Select'].numOptions['Radius']>1){
		tools['Circle Select'].numOptions['Radius'] -= 1;
	} else if (currentTool==='Circle Deselect' && tools['Circle Deselect'].numOptions['Radius']>1){
		tools['Circle Deselect'].numOptions['Radius'] -= 1;
	}
  }
}

window.onresize = function() {
	activity = true;
	
  resizeCanvas(windowWidth, windowHeight);
  W = windowWidth;
  H = windowHeight
};


