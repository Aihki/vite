import { Point } from "./Point";

interface Restaurant{
    _id:string;
    companyId:Number;
    name:string;
    address:String;
    postalCode:String;
    city:String;
    phone:String;
    location:Point;
    company:String;
}

export type {Restaurant}
