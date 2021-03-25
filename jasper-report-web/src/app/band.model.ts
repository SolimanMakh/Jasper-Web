export class Band
{
  name: String;
  rect : fabric.Rect
  expandCircle: fabric.Circle
  fields : any[] = [];
  height: number;
  y: number;




  constructor(name: String , height: number ,y: number)
  {
    this.name = name;
    this.height = height
    this.y = y;

  }



};
