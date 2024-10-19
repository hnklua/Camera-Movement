
/**
 * Matrix with row-major layout:
 *  0       1       2       3
 *  4       5       6       7
 *  8       9       10      11
 *  12      13      14      15
 */
class Mat4 {

    constructor( data ) {
        if( data == null ) {
            this.data = [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1,
            ]
        }
        else {
            this.data = data;
        }
    }

    static identity() {
        return new Mat4( [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ] );
    }

    toString() {
        var str_vals = this.data.map( function( val ) { return "" + val } )
        var str = 
            str_vals.slice( 0, 4 ).join(' ') + '; ' + 
            str_vals.slice( 4, 8 ).join(' ') + '; ' +
            str_vals.slice( 8, 12 ).join(' ') + '; ' +
            str_vals.slice( 12, 16 ).join(' ');

        return '[' + str + ']';
    }

    static rotation_xy( turns ) {
        var rads = 2 * Math.PI * turns;

        var data = [
            Math.cos( rads ), Math.sin( rads ), 0, 0,
            -Math.sin( rads ), Math.cos( rads ), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1, 
        ];

        return new Mat4( data ); 
    }

    static rotation_xz( turns ) {
        var rads = 2 * Math.PI * turns;

        var data = [
            Math.cos( rads ), 0, Math.sin( rads ), 0,
            0, 1, 0, 0,
            -Math.sin( rads ), 0, Math.cos( rads ), 0,
            0, 0, 0, 1,
        ]

        return new Mat4( data );
    }

    static rotation_yz( turns ) {
        var rads = 2 * Math.PI * turns;

        var data = [
            1, 0, 0, 0,
            0, Math.cos( rads ), Math.sin( rads ), 0,
            0, -Math.sin( rads ), Math.cos( rads ), 0,
            0, 0, 0, 1,
        ]

        return new Mat4( data );
    }

    static matrix(turns) {
        var rads = 2 * Math.PI * turns; 

        var data = [
            Math.cos(rads), 0, -Math.sin(rads), 0,
            0, 1, 0, 0, 
            Math.sin(rads), 0, Math.cos(rads), 0, 
            0, 0, 0, 1
        ]

        return new Mat4(data); 
    }

    static translation( dx, dy, dz ) {
        return new Mat4( [
            1, 0, 0, dx,
            0, 1, 0, dy,
            0, 0, 1, dz,
            0, 0, 0, 1,
        ] );
    }

    static scale( sx, sy, sz ) {
        return new Mat4( [
            sx, 0, 0, 0,
            0, sy, 0, 0,
            0, 0, sz, 0, 
            0, 0, 0, 1
        ] );
    }

    mul( right ) {
        let res = new Mat4( new Array(16) );

        for( let i = 0; i < 4; i++ ) {
            for( let j = 0; j < 4; j++ ) {
                res.data[ i * 4 + j ] = 0;
                for( let k = 0; k < 4; k++ ) {
                    res.data[ i * 4 + j ] += 
                        this.data[ i * 4 + k ] *
                        right.data[ k * 4 + j ];
                }
            }
        }

        return res;
    }

	// right multiply by column vector
    transform( x, y, z, w ) {
        let x_p =   this.data[0] * x + this.data[1] * y + 
                    this.data[2] * z + this.data[3] * w;
        let y_p =   this.data[4] * x + this.data[5] * y +
                    this.data[6] * z + this.data[7] * w;
        let z_p =   this.data[8] * x + this.data[9] * y +
                    this.data[10] * z + this.data[11] * w;
        let w_p =   this.data[12] * x + this.data[13] * y +
                    this.data[14] * z + this.data[15] * w;
                    
        return new Vec4( x_p, y_p, z_p, w_p );
    }

    transform_vec( vec ) {
        let res = this.transform( vec.x, vec.y, vec.z, vec.w );

        return new Vec4( res.x, res.y, res.z, res.w );
    }

    basis_x() {
        return new Vec4( this.data[0], this.data[4], this.data[8], this.data[12] );
    }

    basis_y() {
        return new Vec4( this.data[1], this.data[5], this.data[9], this.data[13] );
    }

    basis_z() {
        return new Vec4( this.data[2], this.data[6], this.data[10], this.data[14] );
    }

    rc( row, col ) {
        return this.data[ row * 4 + col ]
    }

    // inverting a 4x4 matrix is ugly, there are 16 determinants we 
    // need to calculate. Because it's such a pain, I looked it up:
    // https://stackoverflow.com/questions/1148309/inverting-a-4x4-matrix
    // author: willnode
    inverse() {
        // var A2323 = m.m22 * m.m33 - m.m23 * m.m32 ;
        const A2323 = this.rc(2, 2) * this.rc(3, 3) - this.rc(2, 3) * this.rc(3, 2); 
        
        // var A1323 = m.m21 * m.m33 - m.m23 * m.m31 ;
        const A1323 = this.rc(2, 1) * this.rc(3, 3) - this.rc(2, 3) * this.rc(3, 1);
        
        // var A1223 = m.m21 * m.m32 - m.m22 * m.m31 ;
        const A1223 = this.rc(2, 1) * this.rc(3, 2) - this.rc(2, 2) * this.rc(3, 1);

        // var A0323 = m.m20 * m.m33 - m.m23 * m.m30 ;
        const A0323 = this.rc(2, 0) * this.rc(3, 3) - this.rc(2, 3) * this.rc(3, 0);

        // var A0223 = m.m20 * m.m32 - m.m22 * m.m30 ;
        const A0223 = this.rc(2, 0) * this.rc(3, 2) - this.rc(2, 2) * this.rc(3, 0);

        // var A0123 = m.m20 * m.m31 - m.m21 * m.m30 ;
        const A0123 = this.rc(2, 0) * this.rc(3, 1) - this.rc(2, 1) * this.rc(3, 0);

        // var A2313 = m.m12 * m.m33 - m.m13 * m.m32 ;
        const A2313 = this.rc(1, 2) * this.rc(3, 3) - this.rc(1, 3) * this.rc(3, 2);

        // var A1313 = m.m11 * m.m33 - m.m13 * m.m31 ;
        const A1313 = this.rc(1, 1) * this.rc(3, 3) - this.rc(1, 3) * this.rc(3, 1);

        // var A1213 = m.m11 * m.m32 - m.m12 * m.m31 ;
        const A1213 = this.rc(1, 1) * this.rc(3, 2) - this.rc(1, 2) * this.rc(3, 1);

        // var A2312 = m.m12 * m.m23 - m.m13 * m.m22 ;
        const A2312 = this.rc(1, 2) * this.rc(2, 3) - this.rc(1, 3) * this.rc(2, 2);

        // var A1312 = m.m11 * m.m23 - m.m13 * m.m21 ;
        const A1312 = this.rc(1, 1) * this.rc(2, 3) - this.rc(1, 3) * this.rc(2, 1);

        // var A1212 = m.m11 * m.m22 - m.m12 * m.m21 ;
        const A1212 = this.rc(1, 1) * this.rc(2, 2) - this.rc(1, 2) * this.rc(2, 1);

        // var A0313 = m.m10 * m.m33 - m.m13 * m.m30 ;
        const A0313 = this.rc(1, 0) * this.rc(3, 3) - this.rc(1, 3) * this.rc(3, 0);

        // var A0213 = m.m10 * m.m32 - m.m12 * m.m30 ;
        const A0213 = this.rc(1, 0) * this.rc(3, 2) - this.rc(1, 2) * this.rc(3, 0);
        
        // var A0312 = m.m10 * m.m23 - m.m13 * m.m20 ;
        const A0312 = this.rc(1, 0) * this.rc(2, 3) - this.rc(1, 3) * this.rc(2, 0);

        // var A0212 = m.m10 * m.m22 - m.m12 * m.m20 ;
        const A0212 = this.rc(1, 0) * this.rc(2, 2) - this.rc(1, 2) * this.rc(2, 0);

        // var A0113 = m.m10 * m.m31 - m.m11 * m.m30 ;
        const A0113 = this.rc(1, 0) * this.rc(3, 1) - this.rc(1, 1) * this.rc(3, 0);
        
        // var A0112 = m.m10 * m.m21 - m.m11 * m.m20 ;
        const A0112 = this.rc(1, 0) * this.rc(2, 1) - this.rc(1, 1) * this.rc(2, 0);
        

        const det = 
        this.rc(0, 0) * ( this.rc(1, 1) * A2323 - this.rc(1, 2) * A1323 + this.rc(1, 3) * A1223 ) -
        this.rc(0, 1) * ( this.rc(1, 0) * A2323 - this.rc(1, 2) * A0323 + this.rc(1, 3) * A0223 ) +
        this.rc(0, 2) * ( this.rc(1, 0) * A1323 - this.rc(1, 1) * A0323 + this.rc(1, 3) * A0123 ) -
        this.rc(0, 3) * ( this.rc(1, 0) * A1223 - this.rc(1, 1) * A0223 + this.rc(1, 2) * A0123 );

        const dr = 1.0 / det;

        return new Mat4( [
            dr * ( this.rc(1, 1) * A2323 - this.rc(1, 2) * A1323 + this.rc(1, 3) * A1223 ),
            dr *-( this.rc(0, 1) * A2323 - this.rc(0, 2) * A1323 + this.rc(0, 3) * A1223 ),
            dr * ( this.rc(0, 1) * A2313 - this.rc(0, 2) * A1313 + this.rc(0, 3) * A1213 ),
            dr *-( this.rc(0, 1) * A2312 - this.rc(0, 2) * A1312 + this.rc(0, 3) * A1212 ),

            dr *-( this.rc(1, 0) * A2323 - this.rc(1, 2) * A0323 + this.rc(1, 3) * A0223 ),
            dr * ( this.rc(0, 0) * A2323 - this.rc(0, 2) * A0323 + this.rc(0, 3) * A0223 ),
            dr *-( this.rc(0, 0) * A2313 - this.rc(0, 2) * A0313 + this.rc(0, 3) * A0213 ),
            dr * ( this.rc(0, 0) * A2312 - this.rc(0, 2) * A0312 + this.rc(0, 3) * A0212 ),

            dr * ( this.rc(1, 0) * A1323 - this.rc(1, 1) * A0323 + this.rc(1, 3) * A0123 ),
            dr *-( this.rc(0, 0) * A1323 - this.rc(0, 1) * A0323 + this.rc(0, 3) * A0123 ),
            dr * ( this.rc(0, 0) * A1313 - this.rc(0, 1) * A0313 + this.rc(0, 3) * A0113 ),
            dr *-( this.rc(0, 0) * A1312 - this.rc(0, 1) * A0312 + this.rc(0, 3) * A0112 ),

            dr *-( this.rc(1, 0) * A1223 - this.rc(1, 1) * A0223 + this.rc(1, 2) * A0123 ),
            dr * ( this.rc(0, 0) * A1223 - this.rc(0, 1) * A0223 + this.rc(0, 2) * A0123 ),
            dr *-( this.rc(0, 0) * A1213 - this.rc(0, 1) * A0213 + this.rc(0, 2) * A0113 ),
            dr * ( this.rc(0, 0) * A1212 - this.rc(0, 1) * A0212 + this.rc(0, 2) * A0112 ),
        ] );
    }

    get_transformed_coordinates() {
        let x = this.data[ 3 ];
        let y = this.data[ 7 ];
        let z = this.data[ 11 ];

        return new Vec4( x, y, z, 1.0 );
    }

    without_w() {
        let clone = this.clone();
        clone.data[12] = clone.data[13] = clone.data[14] = 0;
        clone.data[15] = 1;
        clone.data[3] = 0;
        clone.data[7] = 0;
        clone.data[11] = 0;

        return clone;
    }

    clone() {
        let c = new Array(16);
        for( let i = 0; i < 16; i++ ) { c[i] = this.data[i]; }
        return new Mat4( c );
    }

    static frustum(left, right, bottom, top, near, far) {
        // scalers will scale x,y, values to the near plane 
        let scale_x = 2 * near / (right - left); 
        let scale_y = 2 * near / (top - bottom); 

        // Shift the eye depending on the right/left and top/bottom planes. 
        // This is really only used for VR (left eye and right eye shifted differently)
        let t_x = (right + left) / (right - left); 
        let t_y = (top + bottom) / (top - bottom); 
        
        // Map z into range [-1, 1] linearly 
        const linear_cs = 1 / (far - near); 
        const linear_c1 = near / (far - near); 
        // The w coordinate will always be 1 before being fed to the vertex shader. 
        // therefore, anything we put in row 3, col 4 of the matrix will be added to the z 

        // Map z into the range [-1, 1], but with a non-linear ramp 
        const nonlinear_c2 = (far + near) / (far - near); 
        const nonlinear_c1 = 2 * far * near / (far - near); 

        let c1 = nonlinear_c1; 
        let c2 = nonlinear_c2; 

        return new Mat4([
            scale_x, 0, t_x, 0,
            0, scale_y, t_y, 0,
            0, 0, c2, -c1,
            0, 0, 1, 0,
        ]); 
    }

    static perspective(fovy, aspect, near, far) {
        let top = Math.tan(fovy/2) * near; 
        let bottom = -top; 
        let right = top * aspect; 
        let left = -right; 

        let view = this.frustum(left, right, bottom, top, near, far); 

        return view; 
    }

    static cameraMatrix(yaw, roll, pitch, translation) {

        // Use Euler Order to get camera view 
        let rotationYaw = Mat4.rotation_xz(yaw);
        let rotationPitch = Mat4.rotation_yz(pitch); 
        let rotationRoll = Mat4.rotation_xy(roll); 
        
        let rotationMatrix = rotationYaw.mul(rotationPitch).mul(rotationRoll); 
        let translationMatrix = Mat4.translation(translation.x, translation.y, translation.z);

        // Calculated Camera matrix 
        let cameraMatrix = translationMatrix.mul(rotationMatrix);

        // View 
        let cameraView = cameraMatrix.inverse(); 

        return cameraView; 

    }

}

