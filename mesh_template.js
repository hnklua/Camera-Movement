
let last_update = performance.now(); 
let rotation_y = 0.0; 
let yaw = 0, roll = 0, pitch = 0; 
let move_speed = 0.05; 
let translation = {x: 0, y: 0, z: 0}; 
let keys = Keys.start_listening(); 
let model = null; 
let cameraModel = Mat4.identity(); 

const VERTEX_STRIDE = 28;
const DESIRED_MSPT = 1000; 
class Mesh {
    /** 
     * Creates a new mesh and loads it into video memory.
     * 
     * @param {WebGLRenderingContext} gl  
     * @param {number} program
     * @param {number[]} vertices
     * @param {number[]} indices
    */
    constructor( gl, program, vertices, indices ) {
        this.verts = create_and_load_vertex_buffer( gl, vertices, gl.STATIC_DRAW );
        this.indis = create_and_load_elements_buffer( gl, indices, gl.STATIC_DRAW );

        this.n_verts = vertices.length;
        this.n_indis = indices.length;
        this.program = program;
    }

    /**
     * Create a box mesh with the given dimensions and colors.
     * @param {WebGLRenderingContext} gl 
     * @param {number} width 
     * @param {number} height 
     * @param {number} depth 
     */

    static box( gl, program, width, height, depth ) {
        let hwidth = width / 2.0;
        let hheight = height / 2.0;
        let hdepth = depth / 2.0;

        let verts = [
            hwidth, -hheight, -hdepth,      1.0, 0.0, 0.0, 1.0,
            -hwidth, -hheight, -hdepth,     0.0, 1.0, 0.0, 1.0,
            -hwidth, hheight, -hdepth,      0.0, 0.0, 1.0, 1.0,
            hwidth, hheight, -hdepth,       1.0, 1.0, 0.0, 1.0,

            hwidth, -hheight, hdepth,       1.0, 0.0, 1.0, 1.0,
            -hwidth, -hheight, hdepth,      0.0, 1.0, 1.0, 1.0,
            -hwidth, hheight, hdepth,       0.5, 0.5, 1.0, 1.0,
            hwidth, hheight, hdepth,        1.0, 1.0, 0.5, 1.0,
        ];

        let indis = [
            // clockwise winding
            /*
            0, 1, 2, 2, 3, 0, 
            4, 0, 3, 3, 7, 4, 
            5, 4, 7, 7, 6, 5, 
            1, 5, 6, 6, 2, 1,
            3, 2, 6, 6, 7, 3,
            4, 5, 1, 1, 0, 4,
            */

            // counter-clockwise winding
            0, 3, 2, 2, 1, 0,
            4, 7, 3, 3, 0, 4,
            5, 6, 7, 7, 4, 5,
            1, 2, 6, 6, 5, 1,
            3, 7, 6, 6, 2, 3,
            4, 0, 1, 1, 5, 4,
        ];

        return new Mesh( gl, program, verts, indis );
    }


    /**
     * Render the mesh. Does NOT preserve array/index buffer or program bindings! 
     * 
     * @param {WebGLRenderingContext} gl 
     */
    render( gl ) {
        gl.useProgram( this.program );
        gl.bindBuffer( gl.ARRAY_BUFFER, this.verts );
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indis );

        set_vertex_attrib_to_buffer( 
            gl, this.program, 
            "coordinates", 
            this.verts, 3, 
            gl.FLOAT, false, VERTEX_STRIDE, 0 
        );


        set_vertex_attrib_to_buffer( 
            gl, this.program, 
            "color", 
            this.verts, 4, 
            gl.FLOAT, false, VERTEX_STRIDE, 12
        );

        gl.drawElements( gl.TRIANGLES, this.n_indis, gl.UNSIGNED_SHORT, 0 );
    }

    /**
     * Parse the given text as the body of an obj file.
     * @param {WebGLRenderingContext} gl
     * @param {WebGLProgram} program
     * @param {string} text
     */
    static from_obj_text( gl, program, text ) {
        // your code here
        // Arrays
        let verts = [-1.0, -1.0, -1.0,  1.0, 0.0, 0.0, 1.0,  
            1.0, -1.0, -1.0,  0.0, 1.0, 0.0, 1.0,  
            1.0,  1.0, -1.0,  0.0, 0.0, 1.0, 1.0,  
           -1.0,  1.0, -1.0,  1.0, 1.0, 0.0, 1.0,  
           -1.0, -1.0,  1.0,  1.0, 0.0, 1.0, 1.0,  
            1.0, -1.0,  1.0,  0.0, 1.0, 1.0, 1.0,  
            1.0,  1.0,  1.0,  0.5, 0.5, 1.0, 1.0, 
           -1.0,  1.0,  1.0,  1.0, 1.0, 0.5, 1.0 ];
        let indices = [
            0, 1, 2,  0, 2, 3,
            4, 7, 6,  4, 6, 5,
            3, 2, 6,  3, 6, 7,
            0, 4, 5,  0, 5, 1,
            0, 3, 7,  0, 7, 4,
            1, 5, 6,  1, 6, 2 ]; 

        // Get the list of strings, 
        /*let lines = text.split(/\r?\n/); 

        // Go through array of lines 
        lines.forEach(line => {
            let part_of_line = line.trim().split(/\s+/); // This splits eahc line by whitespace
            
            // Ignore lines contating '#'
            if (part_of_line[0] === '#') {
                return; 
            }

            if (part_of_line[0] === 'v') {
                let x = parseFloat(part_of_line[1]);
                let y = parseFloat(part_of_line[2]);
                let z = parseFloat(part_of_line[3]);

                verts.push(x,y,z, 0.5, 0.5, 0.5, 1.0); 

            } else if (part_of_line[0] === 'f') {
                let i1 = parseInt(part_of_line[1] - 1); 
                let i2 = parseInt(part_of_line[2] - 1); 
                let i3 = parseInt(part_of_line[3] - 1); 
                indices.push(i1, i2, i3); 
            } 
        });*/

        console.log("Vertices:", verts);
        console.log("Indices:", indices);
 
        return new Mesh(gl, program, verts, indices);
    }

    /**
     * Asynchronously load the obj file as a mesh.
     * @param {WebGLRenderingContext} gl
     * @param {string} file_name 
     * @param {WebGLProgram} program
     * @param {function} f the function to call and give mesh to when finished.
     */
    static from_obj_file( gl, file_name, program, f ) {
        let request = new XMLHttpRequest();
        
        // the function that will be called when the file is being loaded
        request.onreadystatechange = function() {
            // console.log( request.readyState );

            if( request.readyState != 4 ) { return; }
            if( request.status != 200 ) { 
                throw new Error( 'HTTP error when opening .obj file: ', request.statusText ); 
            }

            // now we know the file exists and is ready
            let loaded_mesh = Mesh.from_obj_text( gl, program, request.responseText );            

            // Open the request 
            console.log( 'loaded ', file_name );
            f( loaded_mesh );

            // Check if mesh is loaded when ready to draw
            //if (loaded_mesh != null) {
            //    loaded_mesh.render(gl); 
            //}
        };

        
        request.open( 'GET', file_name ); // initialize request. 
        request.send();                   // execute request
    }
}


function render ( now ) {
    requestAnimationFrame( render ); 

    if (loaded_mesh == null) {
        return; 
    }

    // Depth testing 
    gl.enable(gl.DEPTH_TEST); 
    gl.enable(gl.CULL_FACE); 
    gl.frontFace(gl.CCW); 
    gl.cullFace(gl.BACK); 

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 

    // Perspective MAtrix
    let fovy = Math.PI / 2; // 90 degrees 
    let aspect = 800 / 600; 
    let near = 0.1; 
    let far = 1000; 
    let persepctiveModel = Mat4.perspective(fovy, aspect, near, far); 
    //let cameraModel = Mat4.cameraMatrix(yaw, roll, pitch, translation); 

    let finalMatrix = persepctiveModel.mul(cameraModel).mul(model); 
    set_uniform_matrix4(gl, shader_program, "modelview", finalMatrix.data); 

    // Check if mesh is loaded when ready to draw
    if (loaded_mesh != null) {
        loaded_mesh.render(gl); 
    } else {
        console.log("Mesh not loaded!"); 
    }
}

setInterval(function update() {
        // Current time
        let now = performance.now(); 

        // Rotating scene objects, moving camera, etc. 
        // Number of seconds since last frame 

        let time_delta = (now - last_update) / 1000; 
        last_update = now; 

        const ROTATION_SPEED_Y = 0; // Cube should lie stationary. 
        rotation_y += ROTATION_SPEED_Y * time_delta; 
    
        // Transfrmations for objects
        let matrix_v = Mat4.matrix(-rotation_y); // This is rotation
        let scale_v = Mat4.scale(0.8, 0.8, 0.8); 
        let translate_v = Mat4.translation(0, 0.06, 2); 
        model = translate_v.mul(matrix_v).mul(scale_v); 
    
        // Camera stuff
        // Camera movement 
        switch (true) {
            case keys.iskeyDown('KeyW'):
                translation.z += move_speed;  // Forward
                break;
            
            case keys.iskeyDown('KeyS'):
                translation.z -= move_speed;  // Backward
                break;
            
            case keys.iskeyDown('KeyA'):
                translation.x -= move_speed;  // Left
                break;
            
            case keys.iskeyDown('KeyD'):
                translation.x += move_speed;  // Right
                break;
            
            case keys.iskeyDown('KeyC'):
                translation.y -= move_speed;  // Down
                break;
            
            case keys.iskeyDown('Space'):
                translation.y += move_speed;  // Up
                break;
            
            case keys.iskeyDown('KeyQ'):
                roll -= move_speed;  // Roll Left
                break;
            
            case keys.iskeyDown('KeyE'):
                roll += move_speed;  // Roll Right
                break;
            
            case keys.iskeyDown('ArrowLeft'):
                yaw -= move_speed;  // Rotate Left
                break;
            
            case keys.iskeyDown('ArrowRight'):
                yaw += move_speed;  // Rotate Right
                break;
            
            case keys.iskeyDown('ArrowUp'):
                pitch -= move_speed;  // Rotate Down
                break;
            
            case keys.iskeyDown('ArrowDown'):
                pitch += move_speed;  // Rotate Up
                break;
        
            default:
                break;  
        }
        // Update Camera model 
        cameraModel = Mat4.cameraMatrix(yaw, pitch, roll, translation); 

}, DESIRED_MSPT / 60);  // Updating camera model every 1/60th of a second





