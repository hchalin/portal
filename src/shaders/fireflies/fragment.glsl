void main(){
    // distance to the center of each point
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    // reciprocal fn with a vert shift (1/x)
    float strength =( 0.05 / distanceToCenter) - (.05 * 2.0);

    gl_FragColor = vec4(1.0,1.0, 1.0, strength);
}