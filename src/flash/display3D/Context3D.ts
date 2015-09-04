/**
 * Copyright 2014 Mozilla Foundation
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// Class: Context3D
module Shumway.AVMX.AS.flash.display3D {
  import axCoerceString = Shumway.AVMX.axCoerceString;
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class Context3D extends flash.events.EventDispatcher {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["setTextureAt", "setRenderToTexture", "setRenderToBackBuffer"];
    
    constructor () {
      super();
    }
    
    // JS -> AS Bindings
    
    setTextureAt: (sampler: number /*int*/, texture: flash.display3D.textures.TextureBase) => void;
    setRenderToTexture: (texture: flash.display3D.textures.TextureBase, enableDepthAndStencil: boolean = false, antiAlias: number /*int*/ = 0, surfaceSelector: number /*int*/ = 0) => void;
    setRenderToBackBuffer: () => void;
    
    // AS -> JS Bindings
    
    // _driverInfo: string;
    // _enableErrorChecking: boolean;
    get driverInfo(): string {
      release || notImplemented("public flash.display3D.Context3D::get driverInfo"); return;
      // return this._driverInfo;
    }
    get enableErrorChecking(): boolean {
      release || notImplemented("public flash.display3D.Context3D::get enableErrorChecking"); return;
      // return this._enableErrorChecking;
    }
    set enableErrorChecking(toggle: boolean) {
      toggle = !!toggle;
      release || notImplemented("public flash.display3D.Context3D::set enableErrorChecking"); return;
      // this._enableErrorChecking = toggle;
    }
    dispose(): void {
      release || notImplemented("public flash.display3D.Context3D::dispose"); return;
    }
    configureBackBuffer(width: number /*int*/, height: number /*int*/, antiAlias: number /*int*/, enableDepthAndStencil: boolean = true, wantsBestResolution: boolean = false): void {
      width = width | 0; height = height | 0; antiAlias = antiAlias | 0; enableDepthAndStencil = !!enableDepthAndStencil; wantsBestResolution = !!wantsBestResolution;
      release || notImplemented("public flash.display3D.Context3D::configureBackBuffer"); return;
    }
    clear(red: number = 0, green: number = 0, blue: number = 0, alpha: number = 1, depth: number = 1, stencil: number /*uint*/ = 0, mask: number /*uint*/ = 4294967295): void {
      red = +red; green = +green; blue = +blue; alpha = +alpha; depth = +depth; stencil = stencil >>> 0; mask = mask >>> 0;
      release || notImplemented("public flash.display3D.Context3D::clear"); return;
    }
    drawTriangles(indexBuffer: flash.display3D.IndexBuffer3D, firstIndex: number /*int*/ = 0, numTriangles: number /*int*/ = -1): void {
      indexBuffer = indexBuffer; firstIndex = firstIndex | 0; numTriangles = numTriangles | 0;
      release || notImplemented("public flash.display3D.Context3D::drawTriangles"); return;
    }
    present(): void {
      release || notImplemented("public flash.display3D.Context3D::present"); return;
    }
    setProgram(program: flash.display3D.Program3D): void {
      program = program;
      release || notImplemented("public flash.display3D.Context3D::setProgram"); return;
    }
    setProgramConstantsFromVector(programType: string, firstRegister: number /*int*/, data: ASVector<any>, numRegisters: number /*int*/ = -1): void {
      programType = axCoerceString(programType); firstRegister = firstRegister | 0; data = data; numRegisters = numRegisters | 0;
      release || notImplemented("public flash.display3D.Context3D::setProgramConstantsFromVector"); return;
    }
    setProgramConstantsFromMatrix(programType: string, firstRegister: number /*int*/, matrix: flash.geom.Matrix3D, transposedMatrix: boolean = false): void {
      programType = axCoerceString(programType); firstRegister = firstRegister | 0; matrix = matrix; transposedMatrix = !!transposedMatrix;
      release || notImplemented("public flash.display3D.Context3D::setProgramConstantsFromMatrix"); return;
    }
    setProgramConstantsFromByteArray(programType: string, firstRegister: number /*int*/, numRegisters: number /*int*/, data: flash.utils.ByteArray, byteArrayOffset: number /*uint*/): void {
      programType = axCoerceString(programType); firstRegister = firstRegister | 0; numRegisters = numRegisters | 0; data = data; byteArrayOffset = byteArrayOffset >>> 0;
      release || notImplemented("public flash.display3D.Context3D::setProgramConstantsFromByteArray"); return;
    }
    setVertexBufferAt(index: number /*int*/, buffer: flash.display3D.VertexBuffer3D, bufferOffset: number /*int*/ = 0, format: string = "float4"): void {
      index = index | 0; buffer = buffer; bufferOffset = bufferOffset | 0; format = axCoerceString(format);
      release || notImplemented("public flash.display3D.Context3D::setVertexBufferAt"); return;
    }
    setBlendFactors(sourceFactor: string, destinationFactor: string): void {
      sourceFactor = axCoerceString(sourceFactor); destinationFactor = axCoerceString(destinationFactor);
      release || notImplemented("public flash.display3D.Context3D::setBlendFactors"); return;
    }
    setColorMask(red: boolean, green: boolean, blue: boolean, alpha: boolean): void {
      red = !!red; green = !!green; blue = !!blue; alpha = !!alpha;
      release || notImplemented("public flash.display3D.Context3D::setColorMask"); return;
    }
    setDepthTest(depthMask: boolean, passCompareMode: string): void {
      depthMask = !!depthMask; passCompareMode = axCoerceString(passCompareMode);
      release || notImplemented("public flash.display3D.Context3D::setDepthTest"); return;
    }
    setCulling(triangleFaceToCull: string): void {
      triangleFaceToCull = axCoerceString(triangleFaceToCull);
      release || notImplemented("public flash.display3D.Context3D::setCulling"); return;
    }
    setStencilActions(triangleFace: string = "frontAndBack", compareMode: string = "always", actionOnBothPass: string = "keep", actionOnDepthFail: string = "keep", actionOnDepthPassStencilFail: string = "keep"): void {
      triangleFace = axCoerceString(triangleFace); compareMode = axCoerceString(compareMode); actionOnBothPass = axCoerceString(actionOnBothPass); actionOnDepthFail = axCoerceString(actionOnDepthFail); actionOnDepthPassStencilFail = axCoerceString(actionOnDepthPassStencilFail);
      release || notImplemented("public flash.display3D.Context3D::setStencilActions"); return;
    }
    setStencilReferenceValue(referenceValue: number /*uint*/, readMask: number /*uint*/ = 255, writeMask: number /*uint*/ = 255): void {
      referenceValue = referenceValue >>> 0; readMask = readMask >>> 0; writeMask = writeMask >>> 0;
      release || notImplemented("public flash.display3D.Context3D::setStencilReferenceValue"); return;
    }
    setScissorRectangle(rectangle: flash.geom.Rectangle): void {
      rectangle = rectangle;
      release || notImplemented("public flash.display3D.Context3D::setScissorRectangle"); return;
    }
    createVertexBuffer(numVertices: number /*int*/, data32PerVertex: number /*int*/): flash.display3D.VertexBuffer3D {
      numVertices = numVertices | 0; data32PerVertex = data32PerVertex | 0;
      release || notImplemented("public flash.display3D.Context3D::createVertexBuffer"); return;
    }
    createIndexBuffer(numIndices: number /*int*/): flash.display3D.IndexBuffer3D {
      numIndices = numIndices | 0;
      release || notImplemented("public flash.display3D.Context3D::createIndexBuffer"); return;
    }
    createTexture(width: number /*int*/, height: number /*int*/, format: string, optimizeForRenderToTexture: boolean, streamingLevels: number /*int*/ = 0): flash.display3D.textures.Texture {
      width = width | 0; height = height | 0; format = axCoerceString(format); optimizeForRenderToTexture = !!optimizeForRenderToTexture; streamingLevels = streamingLevels | 0;
      release || notImplemented("public flash.display3D.Context3D::createTexture"); return;
    }
    createCubeTexture(size: number /*int*/, format: string, optimizeForRenderToTexture: boolean, streamingLevels: number /*int*/ = 0): flash.display3D.textures.CubeTexture {
      size = size | 0; format = axCoerceString(format); optimizeForRenderToTexture = !!optimizeForRenderToTexture; streamingLevels = streamingLevels | 0;
      release || notImplemented("public flash.display3D.Context3D::createCubeTexture"); return;
    }
    createProgram(): flash.display3D.Program3D {
      release || notImplemented("public flash.display3D.Context3D::createProgram"); return;
    }
    drawToBitmapData(destination: flash.display.BitmapData): void {
      destination = destination;
      release || notImplemented("public flash.display3D.Context3D::drawToBitmapData"); return;
    }
    setRenderToTextureInternal(texture: flash.display3D.textures.TextureBase, targetType: number /*int*/, enableDepthAndStencil: boolean, antiAlias: number /*int*/, surfaceSelector: number /*int*/): void {
      texture = texture; targetType = targetType | 0; enableDepthAndStencil = !!enableDepthAndStencil; antiAlias = antiAlias | 0; surfaceSelector = surfaceSelector | 0;
      release || notImplemented("public flash.display3D.Context3D::setRenderToTextureInternal"); return;
    }
    setTextureInternal(sampler: number /*int*/, texture: flash.display3D.textures.Texture): void {
      sampler = sampler | 0; texture = texture;
      release || notImplemented("public flash.display3D.Context3D::setTextureInternal"); return;
    }
    setCubeTextureInternal(sampler: number /*int*/, texture: flash.display3D.textures.CubeTexture): void {
      sampler = sampler | 0; texture = texture;
      release || notImplemented("public flash.display3D.Context3D::setCubeTextureInternal"); return;
    }
  }
}
