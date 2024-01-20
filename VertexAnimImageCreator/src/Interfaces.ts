

export class Vec3
{
    public x : number = 0;
    public y : number = 0;
    public z : number = 0;
}

export class SpineVertAnimImageJson
{
    public imageName : string = "";
    public animations : {
        animName : string;
        frames : {
            frameIndex : number;
            vertices : Vec3[];
            alpha : number[];
        }[];
    }[] = []
}




export class OutputAnim
{
    public animName : string = "";
    public frames : {
        startFrameIndex : number;
        endFrameIndex : number;
    } = {startFrameIndex: 0, endFrameIndex: 0};
}

export class ImageOutputJson
{
    public imageName : string = "";

    public width : number = 0;
    public height : number = 0;

    public animGapFrame : number = 0;
    public vertexPrecision : number = 10;

    public animations : OutputAnim[] = [];
}

export class OutputJson
{
    public images : ImageOutputJson[] = [];
}