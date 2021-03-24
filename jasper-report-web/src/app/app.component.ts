import { Parser } from '@angular/compiler/src/ml_parser/parser';
import { Component, ElementRef, HostListener, Renderer2, ViewChild } from '@angular/core';
import {fabric} from "fabric"
import {Band} from "./band.model"

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

  constructor(private renderer : Renderer2)
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
      this.bands[i] = new Band("Test",100,20 + 100*i)
    }

    }

    ngAfterViewInit()
    {

    // this.CanvasContext = this.renderer.selectRootElement(this.canvas).nativeElement.getContext('2d');

    //this.CanvasContext.fillStyle = "red"
    // this.CanvasContext.fillRect(20,20,400,60);


    // inializing a fabric canvas Element
    this.canvasFabricRef = new fabric.Canvas(this.canvas.nativeElement,{  preserveObjectStacking: true})



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
      this.bands[i].rect = new fabric.Rect({left: 0, top: this.bands[i].y , stroke: "blue" ,fill:"transparent" ,width:799,height:100, strokeWidth:1});
      this.bands[i].rect.lockMovementX = true;
      this.bands[i].rect.lockMovementY = true;
      this.bands[i].rect.hasControls = false;

      this.canvasFabricRef.add(this.bands[i].rect);
      var that = this


      this.bands[i].rect.on('selected',function (evt)
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


        // Adding Expand Circle
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



//Adding Test Text
    const text = new fabric.Text("Static!!!", {fontSize:20, left:350,top:30})

      this.canvasFabricRef.add(text);
      text.on('mouseup',evt =>
      {
        console.log(evt.transform.width)
      }
      )




/*this.canvasFabricRef.on('mouse:down', function(options: any) {
 // console.log(options.e.clientX, options.e.clientY);
});*/





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
  if (this.bands[this.bandChosen] === undefined)
     return;
  //console.log(evt)
  this.canvasFabricRef.remove (this.bands[this.bandChosen].rect)
  this.canvasFabricRef.remove (this.bands[this.bandChosen].expandCircle)


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
    this.bands[0].rect =  new fabric.Rect({left: 0, top: this.bands[0].y , stroke: "blue" ,fill:"transparent" ,width:799,height:100, strokeWidth:1 });
    this.bands[0].rect.lockMovementX = true;
    this.bands[0].rect.lockMovementY = true;
    this.bands[0].rect.hasControls = false;
    var that = this
    this.canvasFabricRef.add(this.bands[0].rect)

    this.bands[0].rect.on('selected',function (evt)
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


    return


  }

  if (!this.bands[this.bandChosen + 1]){
  this.bands.push( new Band("Test",100,this.bands[this.bands.length -1].y+ this.bands[this.bands.length - 1 ].rect.get('height') ) )
  this.bands[this.bands.length - 1].rect =  new fabric.Rect({left: 0, top: this.bands[this.bands.length - 1].y , stroke: "blue" ,fill:"transparent" ,width:799,height:100, strokeWidth:1 });
  this.bands[this.bands.length - 1].rect.lockMovementX = true;
  this.bands[this.bands.length - 1].rect.lockMovementY = true;
  this.bands[this.bands.length - 1].rect.hasControls = false;
  this.canvasFabricRef.add(this.bands[this.bands.length - 1].rect)
  var that = this
  this.bands[this.bands.length - 1].rect.on('selected',function (evt)
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
else
{
  this.bands.splice(this.bandChosen + 1,0, new Band("Test",100,this.bands[this.bandChosen + 1 ].y))
  this.bands[this.bandChosen +1].rect =  new fabric.Rect({left: 0, top: this.bands[this.bandChosen+1].y , stroke: "red" ,fill:"transparent" ,width:799,height:100, strokeWidth:1 });
  this.bands[this.bandChosen +1].rect.lockMovementX = true;
  this.bands[this.bandChosen +1].rect.lockMovementY = true;
  this.bands[this.bandChosen +1].rect.hasControls = false;
  this.canvasFabricRef.add(this.bands[this.bandChosen + 1].rect)
  var that = this
  this.bands[this.bandChosen +1].rect.on('selected',function (evt)
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
})

}


for (var i = this.bandChosen + 2 ; i < this.bands.length; i++)
{

  this.bands[i].rect.set({top:this.bands[i].rect.get('top') + this.bands[this.bandChosen + 1].rect.get('height')})
  this.bands[i].y = this.bands[i].rect.get('top')
  this.bands[i].rect.setCoords();


}


}





}
