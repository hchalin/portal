uniform float uPixelRatio;
uniform float uSize;
uniform float uTime;

attribute float aScale;

void main(){
    /**
    This code represents the position for each firefly point
    Where position is a attribute on the fireflie geometry being a
    float 32 vec3(x, y, z) array.
    */

    // Transform form from object space to world space
    vec4 modelPosition = modelMatrix * vec4(position, 1) ; // See notes
    float tRandom = modelPosition.x * 1000.0; // use pos.x randomess valuse to offset the sinWave, ex: sin(x * 1000)
    // aScale will control the distanc travelled, smaller val -> less distance travelled
    modelPosition.y += (sin(uTime + tRandom) * aScale * .06);
    // The cameras transformation in the scene
    vec4 viewPosition = viewMatrix * modelPosition;


    //  represents the transformation from view space to clip space (screen space).
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;
    gl_PointSize = uSize * aScale * uPixelRatio ;
    gl_PointSize *= (1.0 / - viewPosition.z); // Size Attenuation

}




/*
Notes:
    The 1.0 in the model position represents a homogeneous coordinate
*/

