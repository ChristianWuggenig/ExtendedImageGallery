export class Image {
    id: string;
    data_big: string;
    data_small: string;
    desc: string;
    constructor(id:string, data_big: string, data_small: string, desc: string){
        this.id = id;
        this.data_big = data_big;
        this.data_small = data_small;
        this.desc = desc;
    }
}