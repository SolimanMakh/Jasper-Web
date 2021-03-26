import { Parser } from '@angular/compiler/src/ml_parser/parser';
import { Component, ElementRef, HostListener, Inject, Renderer2, ViewChild, ɵɵpureFunction4 } from '@angular/core';
import {fabric} from "fabric"
import { faFont,faTextWidth, faImage, faStickyNote, faDrawPolygon, faEllipsisV, faChartArea, faChartPie} from '@fortawesome/free-solid-svg-icons';

import {Band} from "./band.model"
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'jasper-report-web';

  xhttp : XMLHttpRequest = new XMLHttpRequest();
  parser: DOMParser;
  xmlObj : XMLDocument;
  bands : Band[] = []
  bandChosen;
  faIcons = [faFont,faTextWidth,faImage,faStickyNote,faChartPie ,faEllipsisV]

  paletteTempElement;
  draggedtoBandInCanvas : Band;
  selectedField;

@HostListener('window:keydown', ['$event'])
onClick(e) {
  console.log(e.keyCode)

   if (e.keyCode == 46){
      this.deleteBand()
      console.log(e)
    }
}

  @ViewChild('canvas') canvas : ElementRef<HTMLCanvasElement>
 // CanvasContext :CanvasRenderingContext2D;
  canvasFabricRef: fabric.Canvas
  rect: fabric.Rect

  constructor(private renderer : Renderer2, @Inject(DOCUMENT) document)
  {

  }

    ngOnInit()
    {
      //Creating a DOM parser and Mapping the XML to XMLDOMOBJECT
      this.parser = new DOMParser();


      this.xhttp.onreadystatechange = () => {
        if (this.xhttp.readyState == 4 && this.xhttp.status == 200) {
          this.xmlObj = this.xhttp.responseXML;

          console.log(this.xmlObj)
        }
    };
    this.xhttp.open("GET", "assets/jasper.jrxml", true);
    this.xhttp.send();

    //Adding bands to the bands array of band objects

    for(var i = 0; i < 5; i++)
    {
      this.bands[i] = new Band("Test",100,40 + 100*i)
    }

    }

    ngAfterViewInit()
    {

    // this.CanvasContext = this.renderer.selectRootElement(this.canvas).nativeElement.getContext('2d');

    //this.CanvasContext.fillStyle = "red"
    // this.CanvasContext.fillRect(20,20,400,60);


    // inializing a fabric canvas Element
    this.canvasFabricRef = new fabric.Canvas(this.canvas.nativeElement,{  preserveObjectStacking: true})

    //Adding Vertical Lines
    var line1 = new fabric.Line([ 20, 0, 20, 800 ], {

      stroke: 'blue',
      strokeWidth: 1,
      selectable: false,
      evented: false,
    });

    var line2 = new fabric.Line([ 780, 0, 780, 800 ], {

      stroke: 'blue',
      strokeWidth: 1,
      selectable: false,
      evented: false,
    });

    this.canvasFabricRef.add(line1,line2);


    //Adding graph squares

    const numberOfSquares = 800 / 20;
    for (var i = 0 ; i < numberOfSquares; i++)
    for (var j = 0 ; j < numberOfSquares; j++)
    {
     var sqaure = new fabric.Rect({left: j * 20, top: 20 * i , stroke: "rgb(240,240,240)", opacity:0.5 ,fill:"transparent" ,width:20,height:20, strokeWidth:1 , selectable:false})
     sqaure.hasControls = false;
     this.canvasFabricRef.add(sqaure);

    }

    const numberOfBSquares = 800/150

    for (var i = 0 ; i < numberOfBSquares; i++)
    for (var j = 0 ; j < numberOfBSquares; j++)
    {
     var sqaure = new fabric.Rect({left: j * 150, top: 150 * i , stroke: "rgb(230,230,230)", opacity:0.5 ,fill:"transparent" ,width:150,height:150, strokeWidth:1 , selectable:false})
     sqaure.hasControls = false;

     this.canvasFabricRef.add(sqaure);

    }



    console.log(this.bands)

    //Adding Default Bands.
    for (var i = 0 ; i < this.bands.length; i++)
    {
      this.addingBOI(i);
    }

    }
















// Expanding Selected
Expand(diff = 0)
{

  if (this.bands[this.bandChosen] === undefined)
        return;

      this.bands[this.bandChosen].rect.set({height: this.bands[this.bandChosen].rect.get('height') + diff});
      this.bands[this.bandChosen].rect.setCoords();

      for (var i = this.bandChosen + 1 ; i < this.bands.length; i++)
      {

        this.bands[i].rect.set({top:this.bands[i].rect.get('top')+diff})
        this.bands[i].y = this.bands[i].rect.get('top')

        this.bands[i].rect.setCoords();



      }

      this.canvasFabricRef.renderAll()

}

// Delete a Band based on selection
deleteBand()
{
  if (this.selectedField)
  {
    this.bands.forEach((band) => {
      var index = band.fields.indexOf(this.selectedField);
      if (index !== -1)
      {
        this.canvasFabricRef.remove (this.selectedField);
        band.fields.splice(index,1);
        this.selectedField = null
      }
    })

    return;
  }

  if (this.bands[this.bandChosen] === undefined)
     return;
  //console.log(evt)
  this.canvasFabricRef.remove (this.bands[this.bandChosen].rect)
  this.canvasFabricRef.remove (this.bands[this.bandChosen].expandCircle)
  for (var x = 0; x < this.bands[this.bandChosen].fields.length; x++)
  {
    this,this.canvasFabricRef.remove(this.bands[this.bandChosen].fields[x])
  }


  for (var i = this.bandChosen + 1 ; i < this.bands.length; i++)
  {

    this.bands[i].rect.set({top:this.bands[i].rect.get('top') - this.bands[this.bandChosen].rect.get('height')})
    this.bands[i].y = this.bands[i].rect.get('top')
    this.bands[i].rect.setCoords();

  }


  this.bands.splice(this.bandChosen,1)
  console.log(this.bands)

  this.bandChosen = undefined;



}

//Adding a new band
addBand()
{
  if(this.bands.length == 0)
  {
    this.bands.push( new Band("Test",100,20) )
    this.addingBOI(0);

    return
  }



if (!this.bands[this.bandChosen + 1])
{
    this.bands.push( new Band("Test",100,this.bands[this.bands.length - 1 ].y+ this.bands[this.bands.length - 1].rect.get('height') ) )
    this.addingBOI(this.bands.length - 1)
}
else
{
  this.bands.splice(this.bandChosen + 1,0, new Band("Test",100,this.bands[this.bandChosen + 1 ].y))
  this.addingBOI(this.bandChosen + 1);

  for (var i = this.bandChosen + 2 ; i < this.bands.length; i++)
{

  this.bands[i].rect.set({top:this.bands[i].rect.get('top') + this.bands[this.bandChosen + 1].rect.get('height')})
  this.bands[i].y = this.bands[i].rect.get('top')
  this.bands[i].rect.setCoords();


}
}





}


//Add Based on index

addingBOI( index2:number)
{

  this.bands[index2].rect =  new fabric.Rect({left: -5, top: this.bands[index2].y , stroke: "blue" ,fill:"transparent" ,width:806,height:100, strokeWidth:1 });
  this.bands[index2].rect.lockMovementX = true;
  this.bands[index2].rect.lockMovementY = true;
  this.bands[index2].rect.hasControls = false;
  this.canvasFabricRef.add(this.bands[index2].rect)
  var that = this


   // drag from outside features

   this.bands[index2].rect.on('dragover',function (e)
   {
       this.set({stroke: 'aqua'})
       that.canvasFabricRef.requestRenderAll()
   })

   this.bands[index2].rect.on('object:dragover',function (e)
   {
       this.set({stroke: 'aqua'})
       that.canvasFabricRef.requestRenderAll()
   })


   this.bands[index2].rect.on('dragleave',function (e)
   {
       this.set({stroke: 'blue'})
       that.canvasFabricRef.requestRenderAll()
   })


   this.bands[index2].rect.on('drop',function (e){

     var event = <DragEvent>e.e

     var rectangleDraggedOver

     for (var j = 0 ; j < that.bands.length; j++)
     {
       if(that.bands[j].rect === this)
         {
           rectangleDraggedOver = j
         }

     }

     if(that.paletteTempElement) {
     const text = new fabric.Text("Static!!!", {fontSize:20, left:event.offsetX,top:event.offsetY})
     that.bands[rectangleDraggedOver].fields.push(text)



     // moving fields through bands

     //Dragging
     text.on('moving', function (e)
     {
       for (var i = 0; i < that.bands.length; i++)
       {
         if (text.get('top') > that.bands[i].rect.get('top')
          && text.get('left') > that.bands[i].rect.get('left')
          && text.get('top') + text.get('height') < that.bands[i].rect.get('top') + that.bands[i].rect.get('height')
          && text.get('left') + text.get('width') < that.bands[i].rect.get('left') +  that.bands[i].rect.get('width')
          )
          {
           that.bands.forEach((band) => { band.rect.set({stroke:'blue'}) })

           that.bands[i].rect.set({stroke: "aqua"});
           that.draggedtoBandInCanvas =  that.bands[i]

          }
       }
     })

     //Droping
     text.on('moved', function (e)
     {
       that.bands.forEach((band) =>
       { var index = band.fields.indexOf(text);
         if( index  != -1)
         {

           band.fields.splice(index ,1)

         }
       })

       that.bands.forEach((band) => { band.rect.set({stroke:'blue'}) })
       that.draggedtoBandInCanvas.fields.push(text);
       console.log(that.draggedtoBandInCanvas)
       console.log(e);
     })

     text.on('selected',function(e)
     {
       that.selectedField = text
     })
     text.on('selected:cleared',function(e)
     {
       that.selectedField = text
     })


     that.canvasFabricRef.add(text);
     this.set({stroke: 'blue'})



     that.paletteTempElement = undefined;

   }

   })




  // Selecting a band
  this.bands[index2].rect.on('selected',function (evt)
  {




    for (var j = 0 ; j < that.bands.length; j++)
    {

      that.bands[j].rect.set({stroke:"blue"})
      that.canvasFabricRef.remove(that.bands[j].expandCircle)
      that.bands[j].expandCircle = null;

      if(that.bands[j].rect === this)
        {that.bandChosen = j
          console.log(that.bandChosen)

        }

    }



    this.set({stroke:"black"})


    that.bands[that.bandChosen ].expandCircle = new fabric.Circle({radius:5, left:this.get('left') + 399, top:this.get('top')+this.get('height')-5, fill:'transparent',stroke:'black'})
    that.bands[that.bandChosen ].expandCircle.lockMovementX = true ;
    that.bands[that.bandChosen ].expandCircle.hasControls = false;
    that.bands[that.bandChosen ].expandCircle.hasBorders = false;



    that.canvasFabricRef.add(that.bands[that.bandChosen ].expandCircle)
    that.bands[that.bandChosen ].expandCircle.on('selected',function() {
    this.set({stroke: 'blue'})

    })
    var lastValue = that.bands[that.bandChosen ].expandCircle.top ;

    that.bands[that.bandChosen ].expandCircle.on('modified',function() {



      var diff = this.top - lastValue;
      lastValue = this.top
      that.Expand(diff)

    })


    console.log(that);

  })
}


//On dragging the elemnt from the palette

onDrag(e,f)
{
  console.log(f);
  this.paletteTempElement = f ;
}


}
