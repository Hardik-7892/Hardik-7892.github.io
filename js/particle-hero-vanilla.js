/* ============================================================
   VANILLA PARTICLE HERO — React-quality replica, no React
   GPGPU field + state, cursor velocity, defocus layers, post-noise
   ============================================================ */
(function () {
  'use strict';

  // ----- shaders (verbatim from widget) -----
  var V5 = "\n  attribute vec3 aTargetPosition;\n  attribute vec3 aNormal;\n  attribute vec3 aTargetNormal;\n  attribute float aRandom;\n  attribute float aRankForward;\n  attribute float aRankReverse;\n  attribute vec2 aInteractionUv;\n\n  uniform float uProgress;\n  uniform float uPointSize;\n  uniform float uStaggerAmount;\n  uniform float uBurstDistance;\n  uniform float uBurstStart;\n  uniform float uBurstDuration;\n  uniform float uToOffsetStart;\n  uniform float uToOffsetDuration;\n  uniform float uSettleStart;\n  uniform float uSettleDuration;\n  uniform vec3 uStageStagger;\n  uniform vec3 uStageOffset;\n  uniform float uTargetOffsetDistance;\n  uniform float uNoiseAmount;\n  uniform float uDirection;\n  uniform sampler2D uInteractionState;\n  uniform float uViewportAspect;\n  uniform float uFocusDistance;\n  uniform float uFocusRange;\n  uniform float uFocusFalloff;\n  uniform float uNearDefocusStrength;\n  uniform float uFarDefocusStrength;\n  uniform float uRenderMode;\n  uniform vec3 uLightDirection;\n  uniform float uAmbientStrength;\n  uniform float uDiffuseStrength;\n  uniform float uDiffuseWrap;\n  uniform float uRimStrength;\n  uniform float uRimPower;\n\n  varying float vAlpha;\n  varying float vLighting;\n  varying float vDefocus;\n\n  float easeOutCubic(float t) {\n    float inv = 1.0 - t;\n    return 1.0 - inv * inv * inv;\n  }\n\n  float easeInOutCubic(float t) {\n    return t < 0.5\n      ? 4.0 * t * t * t\n      : 1.0 - pow(-2.0 * t + 2.0, 3.0) * 0.5;\n  }\n\n  float easeInCubic(float t) {\n    return t * t * t;\n  }\n\n  float phaseT(float t, float start, float duration) {\n    return clamp((t - start) / max(duration, 0.00001), 0.0, 1.0);\n  }\n\n  // Cheap hash-like noise, stable per particle from source position.\n  float hash13(vec3 p) {\n    p = fract(p * 0.1031);\n    p += dot(p, p.yzx + 33.33);\n    return fract((p.x + p.y) * p.z);\n  }\n\n  void main() {\n    vec3 sourcePosition = mix(position, aTargetPosition, uDirection);\n    vec3 targetPosition = mix(aTargetPosition, position, uDirection);\n    vec3 sourceNormal = normalize(mix(aNormal, aTargetNormal, uDirection));\n    vec3 targetNormal = normalize(mix(aTargetNormal, aNormal, uDirection));\n\n    float rank = clamp(mix(aRankForward, aRankReverse, uDirection), 0.0, 1.0);\n    float stagger = clamp(uStaggerAmount, 0.0, 0.95);\n\n    // Keep random influence subtle so wipe direction remains readable.\n    float timingJitter = (aRandom - 0.5) * (0.08 * stagger);\n    float delay = clamp(rank * stagger + timingJitter, 0.0, 0.98);\n    float activeWindow = max(1.0 - stagger, 0.00001);\n    float phaseProgress = mix(uProgress, 1.0 - uProgress, uDirection);\n    float localT = clamp((phaseProgress - delay) / activeWindow, 0.0, 1.0);\n\n    float burstDelay = rank * stagger * uStageStagger.x + uStageOffset.x;\n    float toOffsetDelay = rank * stagger * uStageStagger.y + uStageOffset.y;\n    float settleDelay = rank * stagger * uStageStagger.z + uStageOffset.z;\n\n    float burstT = phaseT(localT, uBurstStart + burstDelay, uBurstDuration);\n    float toOffsetT = phaseT(\n      localT,\n      uToOffsetStart + toOffsetDelay,\n      uToOffsetDuration\n    );\n    float settleT = phaseT(localT, uSettleStart + settleDelay, uSettleDuration);\n    float normalT = easeInOutCubic(localT);\n    vec3 morphedNormal = normalize(mix(sourceNormal, targetNormal, normalT));\n\n    float spikeNoise = hash13(sourcePosition * 18.0);\n    float spikeMask = mix(1.0 - uNoiseAmount, 1.0 + uNoiseAmount, spikeNoise);\n    vec3 burstPosition = sourcePosition + sourceNormal * (uBurstDistance * spikeMask);\n    vec3 targetOffsetPosition = targetPosition + targetNormal * (uTargetOffsetDistance * spikeMask);\n\n    vec3 morphed = sourcePosition;\n    morphed = mix(morphed, burstPosition, easeOutCubic(burstT));\n    morphed = mix(morphed, targetOffsetPosition, easeInOutCubic(toOffsetT));\n    morphed = mix(morphed, targetPosition, easeOutCubic(settleT));\n\n    vec4 mvPosition = modelViewMatrix * vec4(morphed, 1.0);\n    vec3 viewNormal = normalize(normalMatrix * morphedNormal);\n    vec4 clipPosition = projectionMatrix * mvPosition;\n    float safeW = max(clipPosition.w, 0.00001);\n    vec4 interactionState = texture2D(uInteractionState, aInteractionUv);\n    vec2 interactionOffsetBrush = interactionState.xy;\n    vec2 interactionOffsetNdc = vec2(\n      interactionOffsetBrush.x / max(uViewportAspect, 0.0001),\n      interactionOffsetBrush.y\n    );\n    clipPosition.xy += interactionOffsetNdc * safeW;\n    vec3 lightDirView = normalize(uLightDirection);\n    vec3 viewDir = normalize(-mvPosition.xyz);\n    float ambient = max(uAmbientStrength, 0.0);\n    float ndl = dot(viewNormal, lightDirView);\n    float diffuseWrap = max(uDiffuseWrap, 0.0);\n    float wrappedDiffuse = max((ndl + diffuseWrap) / (1.0 + diffuseWrap), 0.0);\n    float diffuse = wrappedDiffuse * max(uDiffuseStrength, 0.0);\n    float rimBase = 1.0 - max(dot(viewNormal, viewDir), 0.0);\n    float rim = pow(clamp(rimBase, 0.0, 1.0), max(uRimPower, 0.0001)) * max(uRimStrength, 0.0);\n    vLighting = clamp(ambient + diffuse + rim, 0.0, 1.0);\n\n    float focusDepth = max(-mvPosition.z, 0.0001);\n    float focusRange = max(uFocusRange, 0.0001);\n    float focusFalloff = max(uFocusFalloff, 0.0001);\n    float depthDelta = focusDepth - uFocusDistance;\n    float defocus = smoothstep(\n      focusRange,\n      focusRange + focusFalloff,\n      abs(depthDelta)\n    );\n    float nearWeight = step(depthDelta, 0.0);\n    float nearFarStrength = mix(uFarDefocusStrength, uNearDefocusStrength, nearWeight);\n    vDefocus = clamp(defocus * nearFarStrength, 0.0, 1.0);\n\n    gl_Position = clipPosition;\n    gl_PointSize = uPointSize;\n    vAlpha = 0.92;\n  }\n";
  var G5 = "\n  uniform vec3 uColor;\n  uniform float uRenderMode;\n  varying float vAlpha;\n  varying float vLighting;\n  varying float vDefocus;\n\n  void main() {\n    vec2 centered = gl_PointCoord - vec2(0.5);\n    float dist = dot(centered, centered);\n\n    if (dist > 0.25) {\n      discard;\n    }\n\n    float layer = step(0.5, uRenderMode);\n    float baseFalloff = smoothstep(0.25, 0.0, dist);\n    float focusLayerMask = mix(1.0 - vDefocus, vDefocus, layer);\n    if (focusLayerMask <= 0.0005) {\n      discard;\n    }\n    float spriteRadial = clamp(1.0 - dist * 4.0, 0.0, 1.0);\n    float spriteShade = mix(0.9, 1.0, sqrt(spriteRadial));\n    vec3 baseColor = uColor * (vLighting * spriteShade);\n    gl_FragColor = vec4(baseColor, baseFalloff * vAlpha * focusLayerMask);\n  }\n";
  var rd = "\n  varying vec2 vUv;\n\n  void main() {\n    vUv = uv;\n    gl_Position = vec4(position.xy, 0.0, 1.0);\n  }\n";
  var X5 = "\n  uniform sampler2D uTexture;\n  uniform vec2 uDirection;\n  varying vec2 vUv;\n\n  void main() {\n    vec4 color = texture2D(uTexture, vUv) * 0.227027;\n    color += texture2D(uTexture, vUv + uDirection * 1.384615) * 0.316216;\n    color += texture2D(uTexture, vUv - uDirection * 1.384615) * 0.316216;\n    color += texture2D(uTexture, vUv + uDirection * 3.230769) * 0.070270;\n    color += texture2D(uTexture, vUv - uDirection * 3.230769) * 0.070270;\n    gl_FragColor = color;\n  }\n";
  var Y5 = "\n  uniform sampler2D uTexture;\n  uniform float uOpacity;\n  varying vec2 vUv;\n\n  void main() {\n    vec4 blurred = texture2D(uTexture, vUv);\n    gl_FragColor = vec4(blurred.rgb * uOpacity, blurred.a * uOpacity);\n  }\n";
  var q5 = "\n  uniform sampler2D uTexture;\n  uniform float uTime;\n  uniform float uStrength;\n  uniform float uScale;\n  uniform float uSpeed;\n  varying vec2 vUv;\n\n  float hash12(vec2 p) {\n    vec3 p3 = fract(vec3(p.xyx) * 0.1031);\n    p3 += dot(p3, p3.yzx + 33.33);\n    return fract((p3.x + p3.y) * p3.z);\n  }\n\n  void main() {\n    vec4 base = texture2D(uTexture, vUv);\n    float safeScale = max(uScale, 0.0001);\n    vec2 grainUv = vUv * vec2(1920.0, 1080.0) * safeScale;\n    float flickerRate = max(uSpeed, 0.0) * 36.0;\n    float frameIndex = floor(uTime * max(flickerRate, 0.0001));\n    vec2 grainCellA = floor(grainUv);\n    vec2 grainCellB = floor(grainUv * 1.73 + vec2(17.0, 43.0));\n    vec2 timeSeedA = vec2(frameIndex * 0.73, frameIndex * 1.37);\n    vec2 timeSeedB = vec2(frameIndex * 1.91, frameIndex * 0.47);\n    float grainA = hash12(grainCellA + timeSeedA);\n    float grainB = hash12(grainCellB + timeSeedB);\n    float grain = ((grainA + grainB) * 0.5 - 0.5) * 2.0;\n    float strength = max(uStrength, 0.0);\n    vec3 headroom = min(base.rgb, vec3(1.0) - base.rgb) * 2.0;\n    vec3 noisyColor = base.rgb + grain * strength * headroom;\n    gl_FragColor = vec4(clamp(noisyColor, 0.0, 1.0), base.a);\n  }\n";
  var W5 = "\n  uniform sampler2D uFieldTex;\n  uniform vec2 uTexelSize;\n  uniform float uDelta;\n  uniform vec2 uCursorNdc;\n  uniform vec2 uCursorVelocity;\n  uniform float uCursorInfluence;\n  uniform float uViewportAspect;\n  uniform float uViewportHeightPx;\n  uniform float uCoreRadius;\n  uniform float uTailRadius;\n  uniform float uClumpScale;\n  uniform float uClumpContrast;\n  uniform float uTipBias;\n  uniform float uClusterMemory;\n  uniform float uChainCoherence;\n  uniform float uTime;\n  varying vec2 vUv;\n\n  float inverseSquareMask(float distance, float radius, float falloffPower) {\n    float safeRadius = max(radius, 0.0001);\n    float normalized = distance / safeRadius;\n    float invSq = 1.0 / (1.0 + normalized * normalized);\n    float shaped = pow(invSq, max(falloffPower, 0.0001));\n    float outerCutoff = 1.0 - smoothstep(1.0, 1.35, normalized);\n    return shaped * outerCutoff;\n  }\n\n  float hash12(vec2 p) {\n    vec3 p3 = fract(vec3(p.xyx) * 0.1031);\n    p3 += dot(p3, p3.yzx + 33.33);\n    return fract((p3.x + p3.y) * p3.z);\n  }\n\n  float valueNoise(vec2 p) {\n    vec2 i = floor(p);\n    vec2 f = fract(p);\n    vec2 u = f * f * (3.0 - 2.0 * f);\n    float a = hash12(i);\n    float b = hash12(i + vec2(1.0, 0.0));\n    float c = hash12(i + vec2(0.0, 1.0));\n    float d = hash12(i + vec2(1.0, 1.0));\n    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\n  }\n\n  float fbm3(vec2 p) {\n    float value = 0.0;\n    float amplitude = 0.5;\n    for (int i = 0; i < 3; i += 1) {\n      value += amplitude * valueNoise(p);\n      p = p * 2.03 + vec2(14.7, -9.5);\n      amplitude *= 0.5;\n    }\n    return value / 0.875;\n  }\n\n  void main() {\n    vec2 uv = vUv;\n    vec4 previous = texture2D(uFieldTex, uv);\n    vec2 previousFlow = previous.xy;\n\n    float dt = clamp(uDelta, 0.0001, 0.05);\n    float advectionStrength = 0.06 + 0.16 * clamp(uChainCoherence, 0.0, 1.5);\n    vec2 advectedUv = clamp(uv - previousFlow * advectionStrength * dt, vec2(0.0), vec2(1.0));\n    vec4 advected = texture2D(uFieldTex, advectedUv);\n\n    vec4 north = texture2D(uFieldTex, clamp(uv + vec2(0.0, uTexelSize.y), vec2(0.0), vec2(1.0)));\n    vec4 south = texture2D(uFieldTex, clamp(uv - vec2(0.0, uTexelSize.y), vec2(0.0), vec2(1.0)));\n    vec4 east = texture2D(uFieldTex, clamp(uv + vec2(uTexelSize.x, 0.0), vec2(0.0), vec2(1.0)));\n    vec4 west = texture2D(uFieldTex, clamp(uv - vec2(uTexelSize.x, 0.0), vec2(0.0), vec2(1.0)));\n    vec4 neighbors = (north + south + east + west) * 0.25;\n\n    float diffusion = mix(0.03, 0.09, 1.0 - clamp(uChainCoherence, 0.0, 1.0));\n    vec2 flow = mix(advected.xy, neighbors.xy, diffusion);\n    float fieldStrength = mix(advected.z, neighbors.z, diffusion * 0.9);\n\n    vec2 cursorUv = uCursorNdc * 0.5 + 0.5;\n    vec2 uvDelta = uv - cursorUv;\n    vec2 deltaBrush = vec2(uvDelta.x * uViewportAspect, uvDelta.y);\n    float distancePx = length(deltaBrush) * max(uViewportHeightPx, 1.0) * 0.5;\n    float coreMask = inverseSquareMask(distancePx, uCoreRadius, 2.6);\n    float tailMask = inverseSquareMask(distancePx, uTailRadius, 2.0);\n    float localInject = clamp((coreMask + tailMask * 0.35) * uCursorInfluence, 0.0, 1.0);\n    localInject = pow(localInject, 1.6);\n\n    vec2 cursorVelocityBrush = vec2(uCursorVelocity.x * uViewportAspect, uCursorVelocity.y);\n    float cursorSpeed = length(cursorVelocityBrush);\n    vec2 cursorDirBrush = cursorSpeed > 0.0001 ? cursorVelocityBrush / cursorSpeed : vec2(0.0, 0.0);\n    vec2 radialDir = length(deltaBrush) > 0.0001 ? normalize(deltaBrush) : vec2(0.0, 1.0);\n    vec2 tangentDir = vec2(-radialDir.y, radialDir.x);\n    float swirlSign = sign(cursorVelocityBrush.x * radialDir.y - cursorVelocityBrush.y * radialDir.x);\n    if (abs(swirlSign) < 0.001) {\n      swirlSign = 1.0;\n    }\n\n    vec2 injectDirBrush = normalize(\n      mix(cursorDirBrush, tangentDir * swirlSign, 0.25)\n    );\n    if (length(injectDirBrush) <= 0.0001) {\n      injectDirBrush = tangentDir;\n    }\n    vec2 injectDirNdc = vec2(\n      injectDirBrush.x / max(uViewportAspect, 0.0001),\n      injectDirBrush.y\n    );\n\n    float clumpScale = max(uClumpScale, 0.05);\n    float clumpContrast = clamp(uClumpContrast, 0.0, 1.0);\n    float tipBias = clamp(uTipBias, 0.0, 1.0);\n    float noiseDomainScale = 7.0 + clumpScale * 7.0;\n    vec2 noiseDomain = uv * noiseDomainScale + vec2(uTime * 0.23, -uTime * 0.17);\n    float ridgeNoise = fbm3(noiseDomain);\n    float ridgePhase = (uv.x + uv.y) * (26.0 + clumpScale * 7.5) + ridgeNoise * 6.2831;\n    float ridge = pow(\n      clamp(0.5 + 0.5 * sin(ridgePhase), 0.0, 1.0),\n      mix(1.8, 6.8, clumpContrast)\n    );\n    float tipThreshold = mix(0.48, 0.9, 0.55 * tipBias + 0.45 * clumpContrast);\n    float tipMask = smoothstep(tipThreshold, 1.0, ridge);\n    float injectMask = mix(0.75, 1.0, ridge) * mix(0.78, 1.0, tipMask);\n    float injectAmount = localInject * injectMask;\n\n    float memory = clamp(uClusterMemory, 0.0, 1.2);\n    float flowDecay = exp(-mix(4.6, 1.7, memory) * dt);\n    float strengthDecay = exp(-mix(6.0, 2.2, memory) * dt);\n    flow = flow * flowDecay + injectDirNdc * injectAmount * (0.08 + 0.14 * clamp(uChainCoherence, 0.0, 1.5));\n    fieldStrength = fieldStrength * strengthDecay + injectAmount * (0.46 + 0.32 * clumpContrast);\n\n    float maxFlow = 0.015;\n    float flowMagnitude = length(flow);\n    if (flowMagnitude > maxFlow) {\n      flow *= maxFlow / max(flowMagnitude, 0.0001);\n    }\n\n    fieldStrength = clamp(fieldStrength, 0.0, 1.0);\n    gl_FragColor = vec4(flow, fieldStrength, 1.0);\n  }\n";
  var j5 = "\n  uniform sampler2D uStateTex;\n  uniform sampler2D uFieldTex;\n  uniform sampler2D uSourcePositionTex;\n  uniform sampler2D uTargetPositionTex;\n  uniform sampler2D uTimingTex;\n  uniform sampler2D uSourceNormalTex;\n  uniform sampler2D uTargetNormalTex;\n  uniform float uPointCount;\n  uniform float uTextureSize;\n  uniform float uDelta;\n  uniform float uProgress;\n  uniform float uStaggerAmount;\n  uniform float uBurstDistance;\n  uniform float uBurstStart;\n  uniform float uBurstDuration;\n  uniform float uToOffsetStart;\n  uniform float uToOffsetDuration;\n  uniform float uSettleStart;\n  uniform float uSettleDuration;\n  uniform vec3 uStageStagger;\n  uniform vec3 uStageOffset;\n  uniform float uTargetOffsetDistance;\n  uniform float uNoiseAmount;\n  uniform float uDirection;\n  uniform mat4 uModelViewMatrix;\n  uniform mat4 uProjectionMatrix;\n  uniform mat3 uNormalMatrix;\n  uniform vec2 uCursorNdc;\n  uniform vec2 uCursorVelocity;\n  uniform float uCursorInfluence;\n  uniform float uViewportAspect;\n  uniform float uViewportHeightPx;\n  uniform float uCoreRadius;\n  uniform float uTailRadius;\n  uniform float uCoreStrength;\n  uniform float uTailStrength;\n  uniform float uCoreFalloff;\n  uniform float uTailFalloff;\n  uniform float uDepthFalloff;\n  uniform float uSpringStrength;\n  uniform float uDamping;\n  uniform float uMaxVelocity;\n  uniform float uMaxOffset;\n  uniform float uCurlStrength;\n  uniform float uCurlRadius;\n  uniform float uCurlFalloff;\n  uniform float uNormalDirectionInfluence;\n  uniform float uRepelRandomness;\n  uniform float uClumpScale;\n  uniform float uClumpContrast;\n  uniform float uClumpBoost;\n  uniform float uTipBias;\n  uniform float uClusterMemory;\n  uniform float uChainCoherence;\n  varying vec2 vUv;\n\n  float inverseSquareMask(float distance, float radius, float falloffPower) {\n    float safeRadius = max(radius, 0.0001);\n    float normalized = distance / safeRadius;\n    float invSq = 1.0 / (1.0 + normalized * normalized);\n    float shaped = pow(invSq, max(falloffPower, 0.0001));\n    float outerCutoff = 1.0 - smoothstep(1.0, 1.35, normalized);\n    return shaped * outerCutoff;\n  }\n\n  float easeOutCubic(float t) {\n    float inv = 1.0 - t;\n    return 1.0 - inv * inv * inv;\n  }\n\n  float easeInOutCubic(float t) {\n    return t < 0.5\n      ? 4.0 * t * t * t\n      : 1.0 - pow(-2.0 * t + 2.0, 3.0) * 0.5;\n  }\n\n  float phaseT(float t, float start, float duration) {\n    return clamp((t - start) / max(duration, 0.00001), 0.0, 1.0);\n  }\n\n  float hash13(vec3 p) {\n    p = fract(p * 0.1031);\n    p += dot(p, p.yzx + 33.33);\n    return fract((p.x + p.y) * p.z);\n  }\n\n  float hash12(vec2 p) {\n    vec3 p3 = fract(vec3(p.xyx) * 0.1031);\n    p3 += dot(p3, p3.yzx + 33.33);\n    return fract((p3.x + p3.y) * p3.z);\n  }\n\n  float valueNoise(vec2 p) {\n    vec2 i = floor(p);\n    vec2 f = fract(p);\n    vec2 u = f * f * (3.0 - 2.0 * f);\n    float a = hash12(i);\n    float b = hash12(i + vec2(1.0, 0.0));\n    float c = hash12(i + vec2(0.0, 1.0));\n    float d = hash12(i + vec2(1.0, 1.0));\n    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);\n  }\n\n  float fbm3(vec2 p) {\n    float value = 0.0;\n    float amplitude = 0.5;\n    for (int i = 0; i < 3; i += 1) {\n      value += amplitude * valueNoise(p);\n      p = p * 2.02 + vec2(17.13, -9.41);\n      amplitude *= 0.5;\n    }\n    return value / 0.875;\n  }\n\n  void main() {\n    vec2 cell = floor(gl_FragCoord.xy - vec2(0.5));\n    float index = cell.y * uTextureSize + cell.x;\n    if (index >= uPointCount) {\n      gl_FragColor = vec4(0.0);\n      return;\n    }\n\n    vec4 state = texture2D(uStateTex, vUv);\n    vec2 offsetBrush = state.xy;\n    vec2 velocityBrush = state.zw;\n    vec3 sourcePosition = texture2D(uSourcePositionTex, vUv).xyz;\n    vec3 targetPosition = texture2D(uTargetPositionTex, vUv).xyz;\n    vec4 timing = texture2D(uTimingTex, vUv);\n    vec3 sourceNormalRaw = texture2D(uSourceNormalTex, vUv).xyz;\n    vec3 targetNormalRaw = texture2D(uTargetNormalTex, vUv).xyz;\n    float aRandom = timing.x;\n    float aRankForward = timing.y;\n    float aRankReverse = timing.z;\n\n    vec3 source = mix(sourcePosition, targetPosition, uDirection);\n    vec3 target = mix(targetPosition, sourcePosition, uDirection);\n    vec3 sourceNormal = normalize(mix(sourceNormalRaw, targetNormalRaw, uDirection));\n    vec3 targetNormal = normalize(mix(targetNormalRaw, sourceNormalRaw, uDirection));\n\n    float rank = clamp(mix(aRankForward, aRankReverse, uDirection), 0.0, 1.0);\n    float stagger = clamp(uStaggerAmount, 0.0, 0.95);\n    float timingJitter = (aRandom - 0.5) * (0.08 * stagger);\n    float delay = clamp(rank * stagger + timingJitter, 0.0, 0.98);\n    float activeWindow = max(1.0 - stagger, 0.00001);\n    float phaseProgress = mix(uProgress, 1.0 - uProgress, uDirection);\n    float localT = clamp((phaseProgress - delay) / activeWindow, 0.0, 1.0);\n\n    float burstDelay = rank * stagger * uStageStagger.x + uStageOffset.x;\n    float toOffsetDelay = rank * stagger * uStageStagger.y + uStageOffset.y;\n    float settleDelay = rank * stagger * uStageStagger.z + uStageOffset.z;\n\n    float burstT = phaseT(localT, uBurstStart + burstDelay, uBurstDuration);\n    float toOffsetT = phaseT(\n      localT,\n      uToOffsetStart + toOffsetDelay,\n      uToOffsetDuration\n    );\n    float settleT = phaseT(localT, uSettleStart + settleDelay, uSettleDuration);\n    float normalT = easeInOutCubic(localT);\n    vec3 baseNormal = normalize(mix(sourceNormal, targetNormal, normalT));\n\n    float spikeNoise = hash13(source * 18.0);\n    float spikeMask = mix(1.0 - uNoiseAmount, 1.0 + uNoiseAmount, spikeNoise);\n    vec3 burstPosition = source + sourceNormal * (uBurstDistance * spikeMask);\n    vec3 targetOffsetPosition = target + targetNormal * (uTargetOffsetDistance * spikeMask);\n\n    vec3 basePosition = source;\n    basePosition = mix(basePosition, burstPosition, easeOutCubic(burstT));\n    basePosition = mix(basePosition, targetOffsetPosition, easeInOutCubic(toOffsetT));\n    basePosition = mix(basePosition, target, easeOutCubic(settleT));\n\n    vec4 mvPosition = uModelViewMatrix * vec4(basePosition, 1.0);\n    vec4 clipPosition = uProjectionMatrix * mvPosition;\n    float safeW = max(clipPosition.w, 0.00001);\n    float safeAspect = max(uViewportAspect, 0.0001);\n    vec2 offsetNdc = vec2(offsetBrush.x / safeAspect, offsetBrush.y);\n    vec2 particleNdc = clipPosition.xy / safeW + offsetNdc;\n    vec2 fieldUv = clamp(particleNdc * 0.5 + 0.5, vec2(0.0), vec2(1.0));\n    vec4 fieldSample = texture2D(uFieldTex, fieldUv);\n    vec2 fieldFlowBrushRaw = vec2(fieldSample.x * safeAspect, fieldSample.y);\n    vec2 fieldFlowBrush = length(fieldFlowBrushRaw) > 0.0001\n      ? normalize(fieldFlowBrushRaw)\n      : vec2(0.0, 0.0);\n    float fieldStrength = clamp(fieldSample.z, 0.0, 1.2);\n\n    vec2 ndcDelta = particleNdc - uCursorNdc;\n    vec2 brushDelta = vec2(ndcDelta.x * uViewportAspect, ndcDelta.y);\n    float brushDistance = length(brushDelta);\n    float distancePx = brushDistance * max(uViewportHeightPx, 1.0) * 0.5;\n    vec2 radialDir = brushDistance > 0.0001\n      ? normalize(brushDelta)\n      : vec2(0.0);\n    vec3 viewNormal = normalize(uNormalMatrix * baseNormal);\n    vec2 normalScreenRaw = vec2(\n      viewNormal.x,\n      viewNormal.y\n    );\n    float normalScreenLength = length(normalScreenRaw);\n    vec2 normalScreenDir = normalScreenLength > 0.0001\n      ? normalScreenRaw / normalScreenLength\n      : radialDir;\n    float viewDepth = max(-mvPosition.z, 0.0001);\n    float depthMask = 1.0 / (1.0 + uDepthFalloff * viewDepth);\n\n    float coreMask = inverseSquareMask(distancePx, uCoreRadius, uCoreFalloff);\n    float tailMask = inverseSquareMask(distancePx, uTailRadius, uTailFalloff);\n    float localFieldWeight = clamp((coreMask + tailMask) * 0.9, 0.0, 1.0);\n    float cursorFocus = pow(localFieldWeight, 1.45);\n    float fieldInfluence = fieldStrength * cursorFocus;\n\n    vec3 normalObject = normalize(baseNormal);\n    vec3 referenceAxis = abs(normalObject.y) < 0.92\n      ? vec3(0.0, 1.0, 0.0)\n      : vec3(1.0, 0.0, 0.0);\n    vec3 tangentObject = normalize(cross(referenceAxis, normalObject));\n    vec3 bitangentObject = normalize(cross(normalObject, tangentObject));\n    float localTangent = dot(basePosition, tangentObject);\n    float localBitangent = dot(basePosition, bitangentObject);\n\n    float clumpScale = max(uClumpScale, 0.05);\n    float clumpContrast = clamp(uClumpContrast, 0.0, 1.0);\n    float tipBias = clamp(uTipBias, 0.0, 1.0);\n    float clusterMemory = clamp(uClusterMemory, 0.0, 1.2);\n    float chainCoherence = clamp(uChainCoherence, 0.0, 1.5);\n\n    vec2 localSurface = vec2(localTangent, localBitangent);\n    float flowDensity = 1.4 + clumpScale * 1.55;\n    vec2 flowDomain = localSurface * flowDensity +\n      vec2(aRandom * 5.9, -aRandom * 4.1) +\n      offsetBrush * 2.8;\n    float flowEps = 0.03;\n    float flowPx1 = fbm3(flowDomain + vec2(flowEps, 0.0));\n    float flowPx0 = fbm3(flowDomain - vec2(flowEps, 0.0));\n    float flowPy1 = fbm3(flowDomain + vec2(0.0, flowEps));\n    float flowPy0 = fbm3(flowDomain - vec2(0.0, flowEps));\n    vec2 flowGradA = vec2(flowPx1 - flowPx0, flowPy1 - flowPy0) / (2.0 * flowEps);\n    vec2 flowA = length(flowGradA) > 0.0001\n      ? normalize(vec2(-flowGradA.y, flowGradA.x))\n      : vec2(1.0, 0.0);\n\n    vec2 flowDomainB = flowDomain * 1.91 + vec2(13.7, -8.3);\n    float flowQx1 = fbm3(flowDomainB + vec2(flowEps, 0.0));\n    float flowQx0 = fbm3(flowDomainB - vec2(flowEps, 0.0));\n    float flowQy1 = fbm3(flowDomainB + vec2(0.0, flowEps));\n    float flowQy0 = fbm3(flowDomainB - vec2(0.0, flowEps));\n    vec2 flowGradB = vec2(flowQx1 - flowQx0, flowQy1 - flowQy0) / (2.0 * flowEps);\n    vec2 flowB = length(flowGradB) > 0.0001\n      ? normalize(vec2(-flowGradB.y, flowGradB.x))\n      : vec2(-flowA.y, flowA.x);\n\n    vec2 flowSurface = normalize(mix(flowA, flowB, 0.42 + 0.34 * clumpContrast));\n    if (length(flowSurface) <= 0.0001) {\n      flowSurface = vec2(1.0, 0.0);\n    }\n    vec2 flowPerpSurface = vec2(-flowSurface.y, flowSurface.x);\n\n    float alongFlow = dot(localSurface, flowSurface);\n    float acrossFlow = dot(localSurface, flowPerpSurface);\n    float ridgeFreq = 2.7 + clumpScale * 6.4;\n    float ridgeSharpA = mix(2.0, 9.0, clumpContrast);\n    float ridgeSharpB = mix(1.4, 5.5, clumpContrast);\n    float ridgeA = pow(\n      0.5 + 0.5 * sin(alongFlow * ridgeFreq + fbm3(flowDomain * 0.63 + vec2(5.0, 3.0)) * 6.2831),\n      ridgeSharpA\n    );\n    float ridgeB = pow(\n      0.5 + 0.5 * sin(acrossFlow * (ridgeFreq * 0.62) + aRandom * 6.2831),\n      ridgeSharpB\n    );\n    float filamentSeed = clamp(ridgeA * 0.8 + ridgeA * ridgeB * 0.6, 0.0, 1.0);\n\n    float localDrive = localFieldWeight * uCursorInfluence;\n    float offsetMemory = smoothstep(0.01, 0.28, length(offsetBrush));\n    float memoryGain = mix(0.2, 1.0, clusterMemory);\n    float magnetization = clamp(localDrive + offsetMemory * memoryGain, 0.0, 1.25);\n    float activation = clamp(magnetization * mix(0.62, 1.18, clumpContrast), 0.0, 1.0);\n    float bodyField = smoothstep(0.28, 0.92, filamentSeed) * activation;\n    float tipThreshold = mix(0.52, 0.9, 0.6 * tipBias + 0.4 * clumpContrast);\n    float tipField = smoothstep(tipThreshold, 1.0, filamentSeed) *\n      pow(activation, mix(0.9, 0.45, clumpContrast));\n    bodyField = clamp(\n      max(bodyField, fieldInfluence * (0.28 + 0.24 * clusterMemory)),\n      0.0,\n      1.0\n    );\n    tipField = clamp(\n      max(tipField, fieldInfluence * bodyField * (0.32 + 0.38 * tipBias)),\n      0.0,\n      1.0\n    );\n    float clumpField = clamp(max(bodyField, tipField), 0.0, 1.0);\n\n    float normalBlend = clamp(\n      uNormalDirectionInfluence * (0.62 + 0.32 * bodyField),\n      0.0,\n      1.0\n    );\n    vec2 baseRepulseDir = normalize(\n      mix(radialDir, normalScreenDir, normalBlend)\n    );\n    if (length(baseRepulseDir) <= 0.0001) {\n      baseRepulseDir = radialDir;\n    }\n    if (length(radialDir) > 0.0001 && dot(baseRepulseDir, radialDir) < 0.0) {\n      baseRepulseDir *= -1.0;\n    }\n\n    vec2 cursorVelocityBrush = vec2(uCursorVelocity.x * safeAspect, uCursorVelocity.y);\n    float cursorSpeed = length(cursorVelocityBrush);\n\n    vec3 flowObject = normalize(\n      tangentObject * flowSurface.x + bitangentObject * flowSurface.y\n    );\n    vec3 flowView = normalize(uNormalMatrix * flowObject);\n    vec2 flowScreenRaw = vec2(flowView.x, flowView.y);\n    vec2 flowScreen = length(flowScreenRaw) > 0.0001\n      ? normalize(flowScreenRaw)\n      : vec2(-baseRepulseDir.y, baseRepulseDir.x);\n    if (length(fieldFlowBrush) > 0.0001) {\n      flowScreen = normalize(\n        mix(\n          flowScreen,\n          fieldFlowBrush,\n          clamp(0.18 + 0.32 * fieldInfluence, 0.0, 0.72)\n        )\n      );\n    }\n    if (cursorSpeed > 0.0001) {\n      vec2 cursorDir = cursorVelocityBrush / max(cursorSpeed, 0.0001);\n      if (dot(flowScreen, cursorDir) < 0.0) {\n        flowScreen *= -1.0;\n      }\n    }\n\n    float flowBlend = clamp(\n      0.1 + 0.34 * bodyField + 0.34 * tipField + 0.28 * fieldInfluence,\n      0.0,\n      0.82\n    );\n    vec2 flowBiasedDir = normalize(\n      baseRepulseDir +\n      flowScreen * (0.16 + 0.92 * tipField) +\n      fieldFlowBrush * (0.08 + 0.42 * fieldInfluence)\n    );\n    vec2 repulseDir = length(flowBiasedDir) > 0.0001\n      ? normalize(mix(baseRepulseDir, flowBiasedDir, flowBlend))\n      : baseRepulseDir;\n    if (length(radialDir) > 0.0001 && dot(repulseDir, radialDir) < 0.0) {\n      repulseDir *= -1.0;\n    }\n\n    float randomStrength = clamp(uRepelRandomness, 0.0, 1.5);\n    float perParticleBoost = mix(0.12, 1.0, aRandom);\n    float domainNoise = hash13(\n      basePosition * 11.0 + vec3(offsetBrush * 2.6, aRandom * 3.1)\n    );\n    float domainBoost = mix(\n      0.6,\n      1.0,\n      domainNoise\n    );\n    float randomProfile = mix(\n      0.8 + 0.2 * perParticleBoost,\n      perParticleBoost * domainBoost,\n      0.25\n    );\n    float randomGain = 1.0 + randomStrength * cursorFocus * randomProfile;\n    float bodySuppression = mix(0.1, 1.0, max(bodyField, fieldInfluence * 0.6));\n    float spikeGain = 1.0 +\n      max(uClumpBoost, 0.0) *\n      localFieldWeight *\n      (0.42 * bodyField + 2.8 * tipField + 0.55 * fieldInfluence);\n    float repulseMagnitude = (uCoreStrength * coreMask + uTailStrength * tailMask) *\n      depthMask *\n      uCursorInfluence *\n      randomGain *\n      bodySuppression *\n      spikeGain;\n    vec2 repulseForce = repulseDir * repulseMagnitude;\n\n    float flowMagnitude = (uCoreStrength * 0.06 + uTailStrength * 0.18) *\n      cursorFocus *\n      depthMask *\n      uCursorInfluence *\n      (0.2 * bodyField + 0.62 * tipField + 0.55 * fieldInfluence) *\n      (0.2 + 0.5 * chainCoherence);\n    vec2 flowForce = flowScreen * flowMagnitude;\n    vec2 fieldForce = fieldFlowBrush *\n      (\n        (uCoreStrength * 0.04 + uTailStrength * 0.1) *\n        cursorFocus *\n        depthMask *\n        uCursorInfluence *\n        fieldInfluence *\n        (0.24 + 0.36 * chainCoherence)\n      );\n\n    vec2 tangentDir = vec2(-repulseDir.y, repulseDir.x);\n    float curlMask = inverseSquareMask(distancePx, uCurlRadius, uCurlFalloff);\n    float swirlSign = sign(\n      cursorVelocityBrush.x * repulseDir.y - cursorVelocityBrush.y * repulseDir.x\n    );\n    float curlRandomGain = 1.0 + 0.32 * randomStrength * localFieldWeight * perParticleBoost;\n    float curlSuppression = 1.0 - clamp(\n      chainCoherence * (0.2 * bodyField + 0.66 * tipField + 0.25 * fieldInfluence),\n      0.0,\n      0.95\n    );\n    vec2 curlForce = tangentDir *\n      swirlSign *\n      (\n        uCurlStrength *\n        curlMask *\n        cursorSpeed *\n        depthMask *\n        uCursorInfluence *\n        curlRandomGain *\n        (0.2 + 0.8 * clumpField) *\n        curlSuppression\n      );\n\n    float filingCoherence = clamp(\n      chainCoherence * (0.24 * bodyField + tipField + 0.24 * fieldInfluence),\n      0.0,\n      1.1\n    );\n    vec2 springForce = -offsetBrush * uSpringStrength;\n    vec2 acceleration = repulseForce + flowForce + fieldForce + curlForce + springForce;\n    vec2 flowPerpScreen = vec2(-flowScreen.y, flowScreen.x);\n    vec2 lateralAcceleration = flowPerpScreen * dot(acceleration, flowPerpScreen);\n    acceleration -= lateralAcceleration * clamp(filingCoherence * 0.5, 0.0, 0.85);\n\n    float dt = clamp(uDelta, 0.0001, 0.05);\n    velocityBrush += acceleration * dt;\n    float damping = exp(-max(uDamping, 0.0) * dt);\n    velocityBrush *= damping;\n    float lateralVelocity = dot(velocityBrush, flowPerpScreen);\n    float lateralDamp = clamp(\n      filingCoherence * (0.42 + 0.2 * clumpContrast),\n      0.0,\n      0.85\n    );\n    velocityBrush -= flowPerpScreen * lateralVelocity * lateralDamp;\n\n    float velocityMagnitude = length(velocityBrush);\n    if (velocityMagnitude > uMaxVelocity) {\n      velocityBrush *= uMaxVelocity / max(velocityMagnitude, 0.0001);\n    }\n\n    offsetBrush += velocityBrush * dt;\n    float offsetMagnitude = length(offsetBrush);\n    if (offsetMagnitude > uMaxOffset) {\n      offsetBrush *= uMaxOffset / max(offsetMagnitude, 0.0001);\n      velocityBrush *= 0.45;\n    }\n\n    gl_FragColor = vec4(offsetBrush, velocityBrush);\n  }\n";

  var DEFAULT_URLS = [
    "/assets/models/profile_nobg.bin",
    "/assets/models/cyber.bin",
    "/assets/models/ml.bin",
    "/assets/models/gamedev.bin",
    "/assets/models/cloud.bin",
    "/assets/models/webdev.bin"
  ];

  // defaults matching widget
  var Xa = { staggerAmount: 0.25, burstDistance: 0.1, burstStart: 0, burstDuration: 0.38, toOffsetStart: 0.38, toOffsetDuration: 0.46, settleStart: 0.8, settleDuration: 0.18, stageStagger: [0.22, 0, 0], stageOffset: [0, 0, 0], targetOffsetDistance: 0.045, noiseAmount: 0.18 };
  var Uc = { radius: 0.46, softness: 1.12, strength: 1.3, depthFalloff: 0.45 };
  var Ci = { coreRadiusRatio: 0.36, coreStrength: 10.5, tailStrength: 1.4, coreFalloff: 4.2, tailFalloff: 3, springStrength: 13, damping: 4.6, maxVelocity: 8.5, maxOffset: 0.86, curlStrength: 2.3, curlRadiusRatio: 0.78, curlFalloff: 2.4, normalDirectionInfluence: 0.78, repelRandomness: 0.08, clumpScale: 3.2, clumpContrast: 0.74, clumpBoost: 2.4, tipBias: 0.62, clusterMemory: 0.38, chainCoherence: 0.72 };
  var Ya = { focusRange: 0.14, focusFalloff: 0.32, blurStrength: 0.75, blurResolutionScale: 0.65, blurOpacity: 0.62, nearDefocusStrength: 0.15, farDefocusStrength: 0.9 };
  var Lc = { direction: [0.35, 0.9, 0.45], ambientStrength: 0.32, diffuseStrength: 0.92, diffuseWrap: 0.52, rimStrength: 1.58, rimPower: 7.9 };
  var UE = { enabled: true, strength: 0.1, scale: 1.2, speed: 0.8 };

  var GE = 256;
  var OFFSCREEN_NDC = 2;
  var VD = 0.08, FADE_DUR = 0.18;
  var sV = 0.92, lV = -Math.log(1 - sV);

  function loadThree(cb, errCb) {
    if (window.THREE) { cb(window.THREE); return; }
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';
    s.integrity = 'sha384-qOkzR5Ke/XkQxuGVJ9hpFEpDlcoLtWwVYhnJf06cLIZa2vaIptSqaubivErzmD5O';
    s.crossOrigin = 'anonymous';
    s.onload = function () { cb(window.THREE); };
    s.onerror = function (e) { if (errCb) errCb(e); };
    document.head.appendChild(s);
  }
  function loadPCL(cb, errCb) {
    if (window.PCL) { cb(window.PCL); return; }
    var s = document.createElement('script');
    s.src = '/js/pcl4.js?v=1';
    s.onload = function () { cb(window.PCL); };
    s.onerror = function (e) { if (errCb) errCb(e); };
    document.head.appendChild(s);
  }

  // ---- helpers ----
  function getCameraZ(w, h) {
    var NW = 768, DP = 1512, Tde = 2560;
    var OP = 1.2, Ede = 1.625, Mde = 1.08, PP = 1.95, wde = 2.45, Cde = 0.06, Ade = 0.9;
    if (w <= NW) return Ede;
    if (w <= DP) return OP;
    var t = Math.min(Math.max((w - DP) / (Tde - DP), 0), 1);
    var ti = t * t * t * (t * (t * 6 - 15) + 10);
    var r = OP + (Mde - OP) * ti;
    var aspect = w / Math.max(h, 1);
    if (aspect > PP) {
      var a = Math.min(Math.max((aspect - PP) / (wde - PP), 0), 1);
      r -= Cde * a;
    }
    return Math.max(r, Ade);
  }

  function createVanillaHandle(el, THREE, PCL, opts) {
    var urls = (opts && opts.modelUrls && opts.modelUrls.length) ? opts.modelUrls : DEFAULT_URLS;
    function resolveParticleColor() {
      if (opts && opts.color) return opts.color;
      try {
        var cssVal = getComputedStyle(document.documentElement).getPropertyValue('--particle-color').trim();
        if (cssVal) return cssVal;
      } catch (e) {}
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      return isDark ? '#FBBF24' : '#78716C'; // A: dust→embers (warm amber-copper)
    }
    var colorHex = resolveParticleColor();

    var rect = el.getBoundingClientRect();
    var W = rect.width || el.clientWidth || window.innerWidth;
    var H = rect.height || el.clientHeight || window.innerHeight;
    if (W < 10) W = window.innerWidth * 0.65;
    if (H < 10) H = window.innerHeight - 64;

    var scene = new THREE.Scene();
    var cameraZ = getCameraZ(W, H);
    var camera = new THREE.PerspectiveCamera(44, W / H, 0.1, 100);
    camera.position.set(0, 0, cameraZ);
    camera.lookAt(0, 0, 0);

    var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(W, H, false);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.margin = '0 auto';
    el.appendChild(renderer.domElement);

    var group = new THREE.Group();
    group.position.y = 0.14; // nudge up to match original React placement
    scene.add(group);

    // geometry shared by two defocus layers
    var geom = new THREE.BufferGeometry();

    // uniforms for two layers
    function makeRenderUniforms(renderMode) {
      var lightDir = new THREE.Vector3(Lc.direction[0], Lc.direction[1], Lc.direction[2]).normalize();
      var stageStagger = new THREE.Vector3(Xa.stageStagger[0], Xa.stageStagger[1], Xa.stageStagger[2]);
      var stageOffset = new THREE.Vector3(Xa.stageOffset[0], Xa.stageOffset[1], Xa.stageOffset[2]);
      return {
        uProgress: { value: 0 },
        uPointSize: { value: 2.2 },
        uDirection: { value: 0 },
        uRenderMode: { value: renderMode },
        uStaggerAmount: { value: Xa.staggerAmount },
        uBurstDistance: { value: Xa.burstDistance },
        uBurstStart: { value: Xa.burstStart },
        uBurstDuration: { value: Xa.burstDuration },
        uToOffsetStart: { value: Xa.toOffsetStart },
        uToOffsetDuration: { value: Xa.toOffsetDuration },
        uSettleStart: { value: Xa.settleStart },
        uSettleDuration: { value: Xa.settleDuration },
        uStageStagger: { value: stageStagger },
        uStageOffset: { value: stageOffset },
        uTargetOffsetDistance: { value: Xa.targetOffsetDistance },
        uNoiseAmount: { value: Xa.noiseAmount },
        uInteractionState: { value: null }, // will be set to state texture
        uViewportAspect: { value: W / Math.max(H, 1) },
        uFocusDistance: { value: 1 },
        uFocusRange: { value: Ya.focusRange },
        uFocusFalloff: { value: Ya.focusFalloff },
        uNearDefocusStrength: { value: Ya.nearDefocusStrength },
        uFarDefocusStrength: { value: Ya.farDefocusStrength },
        uLightDirection: { value: lightDir },
        uAmbientStrength: { value: Lc.ambientStrength },
        uDiffuseStrength: { value: Lc.diffuseStrength },
        uDiffuseWrap: { value: Lc.diffuseWrap },
        uRimStrength: { value: Lc.rimStrength },
        uRimPower: { value: Lc.rimPower },
        uColor: { value: new THREE.Color(colorHex) }
      };
    }
    var uniforms0 = makeRenderUniforms(0);
    var uniforms1 = makeRenderUniforms(1);
    var mat0 = new THREE.ShaderMaterial({ vertexShader: V5, fragmentShader: G5, uniforms: uniforms0, transparent: true, depthTest: true, depthWrite: true, blending: THREE.AdditiveBlending });
    var mat1 = new THREE.ShaderMaterial({ vertexShader: V5, fragmentShader: G5, uniforms: uniforms1, transparent: true, depthTest: true, depthWrite: true, blending: THREE.AdditiveBlending });
    var points0 = new THREE.Points(geom, mat0);
    var points1 = new THREE.Points(geom, mat1);
    points0.frustumCulled = false;
    points1.frustumCulled = false;
    group.add(points0);
    group.add(points1);

    // state for morph + interaction + sim
    var clock = new THREE.Clock();
    var raf = 0, running = true;
    var models = [];
    var currentIdx = 0, targetProgress = 0, curProgress = 0, smoothedProgress = 0, smoothT = 0;
    var direction = 0; // 0 = forward, 1 = reverse (widget uses ot)
    var sim = null;
    var cursor = {
      hasPointer: false,
      wasInside: false,
      leaveTime: -Infinity,
      influence: 0,
      rawNdc: new THREE.Vector2(OFFSCREEN_NDC, OFFSCREEN_NDC),
      smoothNdc: new THREE.Vector2(OFFSCREEN_NDC, OFFSCREEN_NDC),
      prevSmoothNdc: new THREE.Vector2(OFFSCREEN_NDC, OFFSCREEN_NDC),
      velocity: new THREE.Vector2(0, 0),
      velocitySmooth: new THREE.Vector2(0, 0),
      tmpVelocity: new THREE.Vector2(0, 0)
    };
    // focus / point size
    var focusDistance = 1;

    // helper: texture creation
    function makeDataTexture(data, size) {
      var tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType);
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.generateMipmaps = false;
      tex.needsUpdate = true;
      return tex;
    }
    function makeRenderTarget(size, linear) {
      var rt = new THREE.WebGLRenderTarget(size, size, {
        depthBuffer: false,
        stencilBuffer: false,
        type: THREE.FloatType,
        minFilter: linear ? THREE.LinearFilter : THREE.NearestFilter,
        magFilter: linear ? THREE.LinearFilter : THREE.NearestFilter,
        generateMipmaps: false,
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping
      });
      rt.texture.minFilter = linear ? THREE.LinearFilter : THREE.NearestFilter;
      rt.texture.magFilter = linear ? THREE.LinearFilter : THREE.NearestFilter;
      rt.texture.generateMipmaps = false;
      return rt;
    }
    function clearRT(rt) {
      var prev = renderer.getRenderTarget();
      var prevClear = renderer.getClearColor(new THREE.Color());
      var prevAlpha = renderer.getClearAlpha();
      renderer.setRenderTarget(rt);
      renderer.setClearColor(0x000000, 0);
      renderer.clear(true, true, false);
      renderer.setRenderTarget(prev);
      renderer.setClearColor(prevClear, prevAlpha);
    }
    // interaction UV
    function ensureInteractionUv(geom, pointCount, texSize) {
      var attr = geom.getAttribute('aInteractionUv');
      if (attr && attr.count === pointCount) return;
      var arr = new Float32Array(pointCount * 2);
      var inv = 1 / texSize;
      for (var i = 0; i < pointCount; i++) {
        var x = i % texSize, y = Math.floor(i / texSize);
        arr[i * 2] = (x + 0.5) * inv;
        arr[i * 2 + 1] = (y + 0.5) * inv;
      }
      geom.setAttribute('aInteractionUv', new THREE.BufferAttribute(arr, 2));
    }
    function packVec3ToRGBA(arr, pointCount, texSize, out) {
      var sz = texSize * texSize * 4;
      var r = out || new Float32Array(sz);
      for (var i = 0; i < pointCount; i++) {
        var ai = i * 3, oi = i * 4;
        r[oi] = arr[ai]; r[oi + 1] = arr[ai + 1]; r[oi + 2] = arr[ai + 2]; r[oi + 3] = 1;
      }
      // fill remainder with zeros
      for (var i = pointCount * 4; i < sz; i++) r[i] = 0;
      return r;
    }
    function packTiming(aRandom, aRankF, aRankR, pointCount, texSize, out) {
      var sz = texSize * texSize * 4;
      var r = out || new Float32Array(sz);
      for (var i = 0; i < pointCount; i++) {
        var oi = i * 4;
        r[oi] = aRandom[i]; r[oi + 1] = aRankF[i]; r[oi + 2] = aRankR[i]; r[oi + 3] = 1;
      }
      for (var i = pointCount * 4; i < sz; i++) r[i] = 0;
      return r;
    }

    // post-processing (blur + noise) setup — minimal replica of Q5/Zre
    var post = (function () {
      var postScene = new THREE.Scene();
      var postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      var quadGeom = new THREE.PlaneGeometry(2, 2);
      var blurMat = new THREE.ShaderMaterial({ vertexShader: rd, fragmentShader: X5, uniforms: { uTexture: { value: null }, uDirection: { value: new THREE.Vector2(0, 0) } }, depthTest: false, depthWrite: false, transparent: false });
      var compositeMat = new THREE.ShaderMaterial({ vertexShader: rd, fragmentShader: Y5, uniforms: { uTexture: { value: null }, uOpacity: { value: 1 } }, depthTest: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending });
      var noiseMat = new THREE.ShaderMaterial({ vertexShader: rd, fragmentShader: q5, uniforms: { uTexture: { value: null }, uTime: { value: 0 }, uStrength: { value: UE.strength }, uScale: { value: UE.scale }, uSpeed: { value: UE.speed } }, depthTest: false, depthWrite: false });
      var quad = new THREE.Mesh(quadGeom, blurMat);
      quad.frustumCulled = false;
      postScene.add(quad);
      var captureTex = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1, THREE.RGBAFormat);
      captureTex.magFilter = THREE.NearestFilter; captureTex.minFilter = THREE.NearestFilter; captureTex.generateMipmaps = false; captureTex.colorSpace = THREE.SRGBColorSpace;
      var oofTarget = makeRenderTarget(1, false);
      oofTarget.depthBuffer = true;
      var blurA = makeRenderTarget(1, false);
      var blurB = makeRenderTarget(1, false);
      blurA.depthBuffer = false; blurB.depthBuffer = false;
      // allow resize
      function setSize(w, h) {
        var s = Math.max(0.25, Math.min(1, Ya.blurResolutionScale));
        var ow = Math.max(1, Math.floor(w * s)), oh = Math.max(1, Math.floor(h * s));
        oofTarget.setSize(ow, oh); blurA.setSize(ow, oh); blurB.setSize(ow, oh);
      }
      setSize(W, H);
      return { postScene: postScene, postCamera: postCamera, quad: quad, quadGeom: quadGeom, blurMat: blurMat, compositeMat: compositeMat, noiseMat: noiseMat, captureTex: captureTex, oofTarget: oofTarget, blurA: blurA, blurB: blurB, setSize: setSize };
    })();

    // sim for GPGPU
    function disposeSim(s) {
      if (!s) return;
      try { s.sourcePosTex.dispose(); } catch (e) { } try { s.targetPosTex.dispose(); } catch (e) { } try { s.timingTex.dispose(); } catch (e) { } try { s.sourceNormTex.dispose(); } catch (e) { } try { s.targetNormTex.dispose(); } catch (e) { }
      try { s.stateA.dispose(); s.stateB.dispose(); } catch (e) { } try { s.fieldA.dispose(); s.fieldB.dispose(); } catch (e) { }
      try { s.simMat.dispose(); s.fieldMat.dispose(); } catch (e) { } try { s.simScene.remove(s.simMesh); s.fieldScene.remove(s.fieldMesh); s.simMesh.geometry.dispose(); s.fieldMesh.geometry.dispose(); } catch (e) { }
    }
    function ensureSim(pointCount, texSize, sourcePos, targetPos, sourceNorm, targetNorm, aRandom, aRankF, aRankR) {
      // if already exists with same size/count, just update textures
      if (sim && sim.size === texSize && sim.pointCount === pointCount) {
        // update data textures
        packVec3ToRGBA(sourcePos, pointCount, texSize, sim.sourcePosArray);
        sim.sourcePosTex.needsUpdate = true;
        packVec3ToRGBA(targetPos, pointCount, texSize, sim.targetPosArray);
        sim.targetPosTex.needsUpdate = true;
        packVec3ToRGBA(sourceNorm, pointCount, texSize, sim.sourceNormArray);
        sim.sourceNormTex.needsUpdate = true;
        packVec3ToRGBA(targetNorm, pointCount, texSize, sim.targetNormArray);
        sim.targetNormTex.needsUpdate = true;
        packTiming(aRandom, aRankF, aRankR, pointCount, texSize, sim.timingArray);
        sim.timingTex.needsUpdate = true;
        return sim;
      }
      if (sim) { disposeSim(sim); sim = null; }
      var size = texSize;
      var sourcePosArr = packVec3ToRGBA(sourcePos, pointCount, size);
      var targetPosArr = packVec3ToRGBA(targetPos, pointCount, size);
      var sourceNormArr = packVec3ToRGBA(sourceNorm, pointCount, size);
      var targetNormArr = packVec3ToRGBA(targetNorm, pointCount, size);
      var timingArr = packTiming(aRandom, aRankF, aRankR, pointCount, size);
      var sPosTex = makeDataTexture(sourcePosArr, size);
      var tPosTex = makeDataTexture(targetPosArr, size);
      var sNormTex = makeDataTexture(sourceNormArr, size);
      var tNormTex = makeDataTexture(targetNormArr, size);
      var timingTex = makeDataTexture(timingArr, size);
      var stateA = makeRenderTarget(size, false);
      var stateB = makeRenderTarget(size, false);
      var fieldA = makeRenderTarget(GE, true);
      var fieldB = makeRenderTarget(GE, true);
      clearRT(stateA); clearRT(stateB); clearRT(fieldA); clearRT(fieldB);
      var quadGeom = new THREE.PlaneGeometry(2, 2);
      var simMat = new THREE.ShaderMaterial({
        vertexShader: rd, fragmentShader: j5,
        uniforms: {
          uStateTex: { value: stateA.texture },
          uFieldTex: { value: fieldA.texture },
          uSourcePositionTex: { value: sPosTex },
          uTargetPositionTex: { value: tPosTex },
          uTimingTex: { value: timingTex },
          uSourceNormalTex: { value: sNormTex },
          uTargetNormalTex: { value: tNormTex },
          uPointCount: { value: pointCount },
          uTextureSize: { value: size },
          uDelta: { value: 1 / 60 },
          uProgress: { value: 0 },
          uStaggerAmount: { value: Xa.staggerAmount },
          uBurstDistance: { value: Xa.burstDistance },
          uBurstStart: { value: Xa.burstStart },
          uBurstDuration: { value: Xa.burstDuration },
          uToOffsetStart: { value: Xa.toOffsetStart },
          uToOffsetDuration: { value: Xa.toOffsetDuration },
          uSettleStart: { value: Xa.settleStart },
          uSettleDuration: { value: Xa.settleDuration },
          uStageStagger: { value: new THREE.Vector3(Xa.stageStagger[0], Xa.stageStagger[1], Xa.stageStagger[2]) },
          uStageOffset: { value: new THREE.Vector3(Xa.stageOffset[0], Xa.stageOffset[1], Xa.stageOffset[2]) },
          uTargetOffsetDistance: { value: Xa.targetOffsetDistance },
          uNoiseAmount: { value: Xa.noiseAmount },
          uDirection: { value: 0 },
          uModelViewMatrix: { value: new THREE.Matrix4() },
          uProjectionMatrix: { value: new THREE.Matrix4() },
          uNormalMatrix: { value: new THREE.Matrix3() },
          uCursorNdc: { value: new THREE.Vector2(OFFSCREEN_NDC, OFFSCREEN_NDC) },
          uCursorVelocity: { value: new THREE.Vector2(0, 0) },
          uCursorInfluence: { value: 0 },
          uViewportAspect: { value: W / Math.max(H, 1) },
          uViewportHeightPx: { value: H },
          uCoreRadius: { value: 0.1 },
          uTailRadius: { value: 0.2 },
          uCoreStrength: { value: 0 },
          uTailStrength: { value: 0 },
          uCoreFalloff: { value: 1.5 },
          uTailFalloff: { value: 1.2 },
          uDepthFalloff: { value: 1 },
          uSpringStrength: { value: 10 },
          uDamping: { value: 6 },
          uMaxVelocity: { value: 1.5 },
          uMaxOffset: { value: 0.2 },
          uCurlStrength: { value: 0.4 },
          uCurlRadius: { value: 0.2 },
          uCurlFalloff: { value: 1.2 },
          uNormalDirectionInfluence: { value: 0.3 },
          uRepelRandomness: { value: 0.4 },
          uClumpScale: { value: 2 },
          uClumpContrast: { value: 0.5 },
          uClumpBoost: { value: 1 },
          uTipBias: { value: 0.7 },
          uClusterMemory: { value: 0.65 },
          uChainCoherence: { value: 0.75 }
        },
        depthTest: false, depthWrite: false
      });
      var fieldMat = new THREE.ShaderMaterial({
        vertexShader: rd, fragmentShader: W5,
        uniforms: {
          uFieldTex: { value: fieldA.texture },
          uTexelSize: { value: new THREE.Vector2(1 / GE, 1 / GE) },
          uDelta: { value: 1 / 60 },
          uCursorNdc: { value: new THREE.Vector2(OFFSCREEN_NDC, OFFSCREEN_NDC) },
          uCursorVelocity: { value: new THREE.Vector2(0, 0) },
          uCursorInfluence: { value: 0 },
          uViewportAspect: { value: W / Math.max(H, 1) },
          uViewportHeightPx: { value: H },
          uCoreRadius: { value: 0.1 },
          uTailRadius: { value: 0.2 },
          uClumpScale: { value: 2 },
          uClumpContrast: { value: 0.5 },
          uTipBias: { value: 0.7 },
          uClusterMemory: { value: 0.65 },
          uChainCoherence: { value: 0.75 },
          uTime: { value: 0 }
        },
        depthTest: false, depthWrite: false
      });
      var simScene = new THREE.Scene();
      var fieldScene = new THREE.Scene();
      var orthoCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      var simMesh = new THREE.Mesh(quadGeom, simMat);
      var fieldMesh = new THREE.Mesh(quadGeom.clone(), fieldMat);
      simMesh.frustumCulled = false; fieldMesh.frustumCulled = false;
      simScene.add(simMesh);
      fieldScene.add(fieldMesh);
      sim = {
        size: size, pointCount: pointCount,
        sourcePosTex: sPosTex, targetPosTex: tPosTex, sourceNormTex: sNormTex, targetNormTex: tNormTex, timingTex: timingTex,
        sourcePosArray: sourcePosArr, targetPosArray: targetPosArr, sourceNormArray: sourceNormArr, targetNormArray: targetNormArr, timingArray: timingArr,
        stateA: stateA, stateB: stateB, fieldA: fieldA, fieldB: fieldB,
        currentState: stateA, nextState: stateB, currentField: fieldA, nextField: fieldB,
        simMat: simMat, fieldMat: fieldMat, simScene: simScene, fieldScene: fieldScene, orthoCam: orthoCam,
        simMesh: simMesh, fieldMesh: fieldMesh, quadGeom: quadGeom,
        modelViewMatrix: new THREE.Matrix4(), normalMatrix: new THREE.Matrix3()
      };
      return sim;
    }

    // geometry helpers
    function computeBounds(pos) {
      var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
      for (var i = 0; i < pos.length; i += 3) {
        var x = pos[i], y = pos[i + 1], z = pos[i + 2];
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
        if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
      }
      return { minX: minX, maxX: maxX, minY: minY, maxY: maxY, minZ: minZ, maxZ: maxZ };
    }
    function makeRank(pos, bounds, axis) {
      var n = pos.length / 3;
      var arr = new Float32Array(n);
      var rx = Math.max(bounds.maxX - bounds.minX, 1e-5);
      var ry = Math.max(bounds.maxY - bounds.minY, 1e-5);
      var rz = Math.max(bounds.maxZ - bounds.minZ, 1e-5);
      for (var i = 0; i < n; i++) {
        var x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2];
        var v = 0;
        switch (axis) {
          case 'x+': v = (x - bounds.minX) / rx; break;
          case 'x-': v = 1 - (x - bounds.minX) / rx; break;
          case 'y+': v = (y - bounds.minY) / ry; break;
          case 'y-': v = 1 - (y - bounds.minY) / ry; break;
          case 'z+': v = (z - bounds.minZ) / rz; break;
          case 'z-': v = 1 - (z - bounds.minZ) / rz; break;
          default: v = (y - bounds.minY) / ry; break;
        }
        arr[i] = Math.min(Math.max(v, 0), 1);
      }
      return arr;
    }
    function makeRandom(n) {
      var arr = new Float32Array(n);
      for (var i = 0; i < n; i++) {
        var v = (i + 1) >>> 0; v ^= v << 13; v ^= v >>> 17; v ^= v << 5;
        arr[i] = (v >>> 0) / 4294967295;
      }
      return arr;
    }
    function rotateY(pos, rad) {
      var c = Math.cos(rad), s = Math.sin(rad);
      var out = new Float32Array(pos.length);
      for (var i = 0; i < pos.length; i += 3) {
        var x = pos[i], y = pos[i + 1], z = pos[i + 2];
        out[i] = x * c + z * s; out[i + 1] = y; out[i + 2] = -x * s + z * c;
      }
      return out;
    }

    // model handling
    var sourceModelYaw = 0, targetModelYaw = 0, modelYawSpeedRad = (Math.PI * 2 / 60 * 1.45); // from widget Xre
    var haveGeometry = false;
    var pendingModels = {}; // url -> {positions, normals, pointCount}
    var activeModels = []; // index-matched to urls
    var geometryPointCount = 0;

    function buildGeometry(positions, normals, texSize, pointCount) {
      var bounds = computeBounds(positions);
      var aRandom = makeRandom(pointCount);
      var aRankF = makeRank(positions, bounds, 'y-'); // forward y-
      var aRankR = makeRank(positions, bounds, 'z+'); // reverse z+
      // center positions is not done here; widget keeps original positions centered via model? We center for vanilla old
      // Keep original as is; but ensure we use same bounds for rank (already).
      geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
      geom.setAttribute('aTargetPosition', new THREE.BufferAttribute(new Float32Array(positions), 3));
      geom.setAttribute('aNormal', new THREE.BufferAttribute(new Float32Array(normals), 3));
      geom.setAttribute('aTargetNormal', new THREE.BufferAttribute(new Float32Array(normals), 3));
      geom.setAttribute('aRandom', new THREE.BufferAttribute(aRandom, 1));
      geom.setAttribute('aRankForward', new THREE.BufferAttribute(aRankF, 1));
      geom.setAttribute('aRankReverse', new THREE.BufferAttribute(aRankR, 1));
      ensureInteractionUv(geom, pointCount, texSize);
      geom.computeBoundingSphere();
      haveGeometry = true;
      geometryPointCount = pointCount;
      // store for sim creation
      geom.userData._aRandom = aRandom;
      geom.userData._aRankF = aRankF;
      geom.userData._aRankR = aRankR;
      geom.userData._bounds = bounds;
    }
    function updateTargetAttributes(positions, normals, pointCount) {
      var aPos = geom.getAttribute('aTargetPosition');
      var aNorm = geom.getAttribute('aTargetNormal');
      if (!aPos || !aNorm) return false;
      if (aPos.count !== pointCount) {
        // recreate if size mismatch (should not happen if models same pointCount, but handle)
        geom.setAttribute('aTargetPosition', new THREE.BufferAttribute(new Float32Array(positions), 3));
        geom.setAttribute('aTargetNormal', new THREE.BufferAttribute(new Float32Array(normals), 3));
      } else {
        aPos.array.set(positions); aPos.needsUpdate = true;
        aNorm.array.set(normals); aNorm.needsUpdate = true;
      }
      // update rank reverse for target
      var bounds = computeBounds(positions);
      var aRankR = makeRank(positions, bounds, 'z+');
      var attrR = geom.getAttribute('aRankReverse');
      if (attrR && attrR.count === pointCount) {
        attrR.array.set(aRankR); attrR.needsUpdate = true;
      }
      return true;
    }

    // interaction: hover repels particles + click+drag rotates
    var isDragging = false;
    var dragStartX = 0, dragStartY = 0;
    var baseYawOffset = 0, basePitchOffset = 0;
    var curDragYaw = 0, curDragPitch = 0;
    function updateCursorFromEvent(e) {
      var rect = renderer.domElement.getBoundingClientRect();
      var w = rect.width, h = rect.height;
      if (w < 1 || h < 1) return;
      var x = ((e.clientX - rect.left) / w) * 2 - 1;
      var y = -((e.clientY - rect.top) / h) * 2 + 1;
      var inside = Math.abs(x) <= 1 && Math.abs(y) <= 1;
      if (inside) {
        cursor.hasPointer = true;
        cursor.rawNdc.set(x, y);
      } else {
        if (cursor.hasPointer) cursor.rawNdc.set(x, y);
      }
      if (!cursor.hasPointer) {
        cursor.hasPointer = true;
        cursor.rawNdc.set(x, y);
        cursor.smoothNdc.copy(cursor.rawNdc);
        cursor.prevSmoothNdc.copy(cursor.rawNdc);
      }
    }
    function onPointerDown(e) {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      try { renderer.domElement.setPointerCapture(e.pointerId); } catch (err) {}
      updateCursorFromEvent(e);
    }
    function onPointerMove(e) {
      updateCursorFromEvent(e);
      if (!isDragging) return;
      var dx = e.clientX - dragStartX;
      var dy = e.clientY - dragStartY;
      curDragYaw = dx * 0.004;
      curDragPitch = dy * 0.004;
      curDragPitch = Math.max(-0.7, Math.min(0.7, curDragPitch));
    }
    function onPointerUp(e) {
      updateCursorFromEvent(e);
      if (!isDragging) return;
      isDragging = false;
      baseYawOffset += curDragYaw;
      basePitchOffset += curDragPitch;
      basePitchOffset = Math.max(-0.7, Math.min(0.7, basePitchOffset));
      curDragYaw = 0;
      curDragPitch = 0;
      try { renderer.domElement.releasePointerCapture(e.pointerId); } catch (err) {}
    }
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.addEventListener('pointerdown', onPointerDown, { passive: true });
    renderer.domElement.addEventListener('pointermove', onPointerMove, { passive: true });
    renderer.domElement.addEventListener('pointerup', onPointerUp, { passive: true });
    renderer.domElement.addEventListener('pointercancel', onPointerUp, { passive: true });
    renderer.domElement.addEventListener('pointerleave', function(e){ updateCursorFromEvent(e); onPointerUp(e); }, { passive: true });

    // resize
    function onResize() {
      var r = el.getBoundingClientRect();
      var w = r.width || el.clientWidth || window.innerWidth;
      var h = r.height || el.clientHeight || window.innerHeight;
      if (w < 10 || h < 10) return;
      W = w; H = h;
      camera.aspect = w / h;
      camera.position.z = getCameraZ(w, h);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      post.setSize(w, h);
      var aspect = w / Math.max(h, 1);
      uniforms0.uViewportAspect.value = aspect;
      uniforms1.uViewportAspect.value = aspect;
      if (sim) {
        sim.simMat.uniforms.uViewportAspect.value = aspect;
        sim.simMat.uniforms.uViewportHeightPx.value = h;
        sim.fieldMat.uniforms.uViewportAspect.value = aspect;
        sim.fieldMat.uniforms.uViewportHeightPx.value = h;
      }
    }
    window.addEventListener('resize', onResize);
    // ensure observer for container resize
    var ro = null;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(function () { onResize(); });
      try { ro.observe(el); } catch (e) { }
    }

    // color reactivity — CSS variable --particle-color or data-theme
    var mo = null;
    try {
      mo = new MutationObserver(function () {
        var newHex = resolveParticleColor();
        var c = new THREE.Color(newHex);
        uniforms0.uColor.value.copy(c);
        uniforms1.uColor.value.copy(c);
      });
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'style', 'class'] });
      // also watch for inline style changes that might set --particle-color
    } catch (e) { }

    // model loading via PCL
    var loadedCount = 0;
    var yawByUrl = {};
    // try to parse provided modelYawByUrl if any
    if (opts && opts.modelYawByUrl) yawByUrl = opts.modelYawByUrl;
    // load all
    urls.forEach(function (url, idx) {
      PCL.load(url).then(function (res) {
        // res: {pointCount, positions, normals}
        // rotate by yaw if provided
        var yawDeg = yawByUrl[url];
        var positions = res.positions, normals = res.normals;
        if (typeof yawDeg === 'number' && isFinite(yawDeg)) {
          var rad = yawDeg * Math.PI / 180;
          positions = rotateY(positions, rad);
          normals = rotateY(normals, rad);
        }
        activeModels[idx] = { pointCount: res.pointCount, positions: positions, normals: normals, url: url };
        loadedCount++;
        if (idx === 0 && !haveGeometry) {
          var pc = res.pointCount;
          var ts = Math.ceil(Math.sqrt(pc));
          buildGeometry(positions, normals, ts, pc);
          ensureSim(pc, ts, positions, positions, normals, normals,
            geom.userData._aRandom, geom.userData._aRankF, geom.userData._aRankR);
          // set initial sim uniforms for point size etc.
          if (typeof opts.onReady === 'function') try { opts.onReady(); } catch (e) { }
        } else if (haveGeometry && idx === 1) {
          // second model as target for morphing
          updateTargetAttributes(positions, normals, res.pointCount);
          // update sim target textures
          if (sim) {
            packVec3ToRGBA(positions, sim.pointCount, sim.size, sim.targetPosArray);
            sim.targetPosTex.needsUpdate = true;
            packVec3ToRGBA(normals, sim.pointCount, sim.size, sim.targetNormArray);
            sim.targetNormTex.needsUpdate = true;
            // rank reverse already updated via geometry
            var aRandom = geom.getAttribute('aRandom').array;
            var aRankF = geom.getAttribute('aRankForward').array;
            var aRankR = geom.getAttribute('aRankReverse').array;
            packTiming(aRandom, aRankF, aRankR, sim.pointCount, sim.size, sim.timingArray);
            sim.timingTex.needsUpdate = true;
          }
        } else {
          // for later morphs, we keep activeModels for switching
        }
      }).catch(function (e) {
        console.warn('[vanilla] load failed', url, e);
        activeModels[idx] = null;
        if (opts && typeof opts.onError === 'function') try { opts.onError(e); } catch (err) { }
      });
    });

    // morph timing - replicate widget's hold+transition but simpler
    var morphDuration = 0.92; // seconds for full morph (widget uses Xa durations + stagger)
    var holdDuration = 3.8;
    var lastSwitch = 0;
    var morphing = false;
    var clockStart = clock.getElapsedTime();
    var autoRotate = true;

    // visibility pause
    var hiddenAt = null, hiddenAccum = 0;
    function onVisibility() {
      if (document.hidden) {
        if (hiddenAt === null) hiddenAt = performance.now();
      } else {
        if (hiddenAt !== null) { hiddenAccum += performance.now() - hiddenAt; hiddenAt = null; }
      }
    }
    document.addEventListener('visibilitychange', onVisibility);

    // helpers for widget math: nV/aoe
    function nV(t) { var e = Math.max(t, 1e-5); return lV / e; }
    function aoe(t) { var e = Math.min(Math.max(t, 0), 1), n = 1 - Math.exp(-lV * e); return Math.min(Math.max(n / sV, 0), 1); }

    var baseScale = 1.0;
    var autoYaw = 0;
    var transitionSpeed = 0.75; // matches widget default
    var curTargetProgress = 0; // target of morph (0 or 1)
    var curSmoothedT = 0; // Ve.current in widget
    var curProgress = 0;  // ut.current in widget
    var prevProgress = 0; // ft.current
    var morphDurationFactor = (function () { var Dde = -Math.log(1 - 0.92); var Ee = Math.max(transitionSpeed, 1e-5); return (Dde / Ee * 1000); })(); // $t in widget
    var De = nV(transitionSpeed);

    window._vanillaDebug = { geom: geom, group: group, scene: scene, camera: camera, renderer: renderer, getSim: function(){return sim}, getUniforms: function(){return {u0:uniforms0,u1:uniforms1}}, getPointCount: function(){return geometryPointCount} };
    // kick off RAF
    var startTime = performance.now();
    var frameCount=0;
    function animate() {
      if (!running) return;
      raf = requestAnimationFrame(animate);
      var dt = clock.getDelta();
      var elapsed = clock.getElapsedTime();
      dt = Math.min(dt, 0.05);
      frameCount++;
      // hover repels particles (restored) — cursorInfluence drives GPGPU
      var pointerInfluence = 0;
      {
        var isInside = cursor.hasPointer && Math.abs(cursor.rawNdc.x) <= 1 && Math.abs(cursor.rawNdc.y) <= 1;
        var targetInf = 0;
        if (isInside) {
          targetInf = 1;
        } else {
          if (cursor.wasInside) cursor.leaveTime = elapsed;
          var sinceLeave = elapsed - cursor.leaveTime;
          if (sinceLeave <= VD) targetInf = 1;
          else if (sinceLeave <= VD + FADE_DUR) {
            var f = (sinceLeave - VD) / FADE_DUR;
            targetInf = 1 - Math.min(Math.max(f, 0), 1);
          } else {
            targetInf = 0;
            cursor.rawNdc.set(OFFSCREEN_NDC, OFFSCREEN_NDC);
          }
        }
        if (isInside && cursor.influence < 0.001) cursor.smoothNdc.copy(cursor.rawNdc);
        cursor.wasInside = isInside;
        var lerpInf = 1 - Math.exp(-22 * dt);
        cursor.influence = cursor.influence + (targetInf - cursor.influence) * lerpInf;
        var lerpPos = 1 - Math.exp(-16 * dt);
        cursor.smoothNdc.lerp(cursor.rawNdc, lerpPos);
        var maxDt = Math.max(dt, 1e-4);
        cursor.tmpVelocity.set((cursor.smoothNdc.x - cursor.prevSmoothNdc.x) / maxDt, (cursor.smoothNdc.y - cursor.prevSmoothNdc.y) / maxDt);
        cursor.prevSmoothNdc.copy(cursor.smoothNdc);
        var lerpVel = 1 - Math.exp(-14 * dt);
        cursor.velocitySmooth.lerp(cursor.tmpVelocity, lerpVel);
        cursor.velocity.copy(cursor.velocitySmooth).multiplyScalar(cursor.influence);
        pointerInfluence = cursor.influence;
      }

      // morph progress smoothing (replicate widget's nV/aoe)
      // Determine targetProgress based on hold/morph state
      if (haveGeometry && activeModels.length > 1 && elapsed - lastSwitch > holdDuration) {
        if (!morphing) {
          // start next morph
          var nxt = (currentIdx + 1) % urls.length;
          var tries = 0;
          while (tries < urls.length && !activeModels[nxt]) { nxt = (nxt + 1) % urls.length; tries++; }
          if (activeModels[nxt]) {
            var info = activeModels[nxt];
            // update target attributes
            updateTargetAttributes(info.positions, info.normals, info.pointCount);
            if (sim) {
              packVec3ToRGBA(info.positions, sim.pointCount, sim.size, sim.targetPosArray);
              sim.targetPosTex.needsUpdate = true;
              packVec3ToRGBA(info.normals, sim.pointCount, sim.size, sim.targetNormArray);
              sim.targetNormTex.needsUpdate = true;
              var aR = geom.getAttribute('aRandom').array;
              var aF = geom.getAttribute('aRankForward').array;
              var aRR = geom.getAttribute('aRankReverse').array;
              packTiming(aR, aF, aRR, sim.pointCount, sim.size, sim.timingArray);
              sim.timingTex.needsUpdate = true;
            }
            currentIdx = nxt;
            direction = 0;
            curTargetProgress = 1;
            morphing = true;
            prevProgress = curProgress;
            curSmoothedT = 0;
            De = nV(transitionSpeed);
          }
          lastSwitch = elapsed;
        }
      }
      // smooth progress like widget
      if (morphing) {
        var target = curTargetProgress;
        var At = Math.max(De, nV(transitionSpeed));
        curSmoothedT = Math.min(1, curSmoothedT + dt / At);
        var eased = aoe(curSmoothedT);
        curProgress = prevProgress + (target - prevProgress) * eased;
        if (curSmoothedT >= 0.999) {
          // finish: swap source to target
          if (curProgress >= 0.999 && target === 1) {
            var srcPos = geom.getAttribute('position');
            var tgtPos = geom.getAttribute('aTargetPosition');
            var srcNorm = geom.getAttribute('aNormal');
            var tgtNorm = geom.getAttribute('aTargetNormal');
            // copy tgt into src
            srcPos.array.set(tgtPos.array); srcPos.needsUpdate = true;
            srcNorm.array.set(tgtNorm.array); srcNorm.needsUpdate = true;
            // update sim source textures
            if (sim) {
              sim.sourcePosArray.set(sim.targetPosArray); sim.sourcePosTex.needsUpdate = true;
              sim.sourceNormArray.set(sim.targetNormArray); sim.sourceNormTex.needsUpdate = true;
            }
            // reset progress
            curProgress = 0; curTargetProgress = 0; prevProgress = 0; curSmoothedT = 0;
            morphing = false;
            lastSwitch = elapsed;
          }
        }
      } else {
        // when not morphing, keep at 0
        if (curProgress !== 0) {
          // ease back to 0 quickly if needed
          curSmoothedT = Math.min(1, curSmoothedT + dt / De);
          var e2 = aoe(curSmoothedT);
          curProgress = prevProgress + (0 - prevProgress) * e2;
          if (curSmoothedT >= 0.999) { curProgress = 0; morphing = false; }
        }
      }

      // group rotation + scale — auto yaw + drag to rotate (click+drag)
      autoYaw += dt * modelYawSpeedRad * 0.6;
      if (isDragging) {
        group.rotation.y = autoYaw + baseYawOffset + curDragYaw;
        group.rotation.x = basePitchOffset + curDragPitch;
      } else {
        group.rotation.y = autoYaw + baseYawOffset;
        // gently return pitch to base when not dragging
        group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, basePitchOffset, Math.min(dt * 0.9, 1));
      }
      var s = baseScale * (1 + Math.sin(elapsed * 0.6) * 0.015);
      group.scale.set(s, s, s);

      // focus distance (widget computes from camera)
      var camWorldPos = new THREE.Vector3(); camWorldPos.setFromMatrixPosition(camera.matrixWorld);
      var groupWorld = new THREE.Vector3(); group.getWorldPosition(groupWorld);
      // simpler: distance from camera to group center
      var tmp = new THREE.Vector3(0, 0, 0);
      tmp.applyMatrix4(group.matrixWorld);
      var viewMat = camera.matrixWorldInverse;
      var mv = new THREE.Vector4(0, 0, 0, 1).applyMatrix4(group.matrixWorld).applyMatrix4(viewMat);
      focusDistance = Math.max(-mv.z, 0.0001);
      var viewportH = H;
      var aspect = W / Math.max(H, 1);

      // update sim if ready
      if (sim && haveGeometry) {
        // update uniforms
        var sm = sim.simMat, fm = sim.fieldMat;
        // modelView / projection from group + camera
        group.updateMatrixWorld();
        sim.modelViewMatrix.multiplyMatrices(camera.matrixWorldInverse, group.matrixWorld);
        sim.normalMatrix.getNormalMatrix(sim.modelViewMatrix);
        // point size adapt like widget: n*er where er = clamp(pow(bi/750?,...))
        // widget computes er = clamp(pow(viewportH / focusDistance / 750 ???) ) and pointSize = n*er
        // simplified: use base pointSize 3 * viewport factor
        var toe = 900, noe = 750, ioe = 0.78, roe = 0.48, ooe = 1.7;
        var bi = Math.max(viewportH / focusDistance, 1e-5);
        var er = Math.min(Math.max(Math.pow(Math.max(bi / noe, 1e-5), ioe), roe), ooe);
        var pointSize = 3 * er;
        // cursor radius scaled
        var soft = Uc.softness;
        var radius = Uc.radius;
        var coreRadius = radius * THREE.MathUtils.clamp(Ci.coreRadiusRatio, 0.05, 1) * (toe * 0.5) * THREE.MathUtils.clamp((radius - 0.2) / 1.6, 0, 1) * 0; // placeholder
        // Use same logic as widget: Mo = o*l erp, _r = Mo*clamp(...), nr=toe*0.5, ir=Mo*nr etc.
        var sr = THREE.MathUtils.clamp((radius - 0.2) / 1.6, 0, 1);
        var Mo = radius * THREE.MathUtils.lerp(0.86, 1.36, sr);
        var _r = Mo * THREE.MathUtils.clamp(Ci.coreRadiusRatio, 0.05, 1);
        var nr = toe * 0.5;
        var ir = Mo * nr;
        var Lr = _r * nr;
        var Kr = Math.max(0.45, Ci.coreFalloff * THREE.MathUtils.lerp(1.3, 0.72, sr));
        var ie = Math.max(0.35, Ci.tailFalloff * THREE.MathUtils.lerp(1.2, 0.78, sr));
        var ne = Mo * THREE.MathUtils.clamp(Ci.curlRadiusRatio, 0.1, 2.4) * nr;

        sm.uniforms.uStateTex.value = sim.currentState.texture;
        sm.uniforms.uFieldTex.value = sim.currentField.texture;
        sm.uniforms.uDelta.value = dt;
        sm.uniforms.uProgress.value = curProgress;
        sm.uniforms.uDirection.value = direction;
        sm.uniforms.uModelViewMatrix.value.copy(sim.modelViewMatrix);
        sm.uniforms.uProjectionMatrix.value.copy(camera.projectionMatrix);
        sm.uniforms.uNormalMatrix.value.copy(sim.normalMatrix);
        sm.uniforms.uCursorNdc.value.copy(cursor.smoothNdc);
        sm.uniforms.uCursorVelocity.value.copy(cursor.velocity);
        sm.uniforms.uCursorInfluence.value = pointerInfluence;
        sm.uniforms.uViewportAspect.value = aspect;
        sm.uniforms.uViewportHeightPx.value = viewportH;
        sm.uniforms.uCoreRadius.value = Lr;
        sm.uniforms.uTailRadius.value = ir;
        sm.uniforms.uCoreStrength.value = Uc.strength * Ci.coreStrength;
        sm.uniforms.uTailStrength.value = Uc.strength * Ci.tailStrength;
        sm.uniforms.uCoreFalloff.value = Kr;
        sm.uniforms.uTailFalloff.value = ie;
        sm.uniforms.uDepthFalloff.value = Uc.depthFalloff;
        sm.uniforms.uSpringStrength.value = Ci.springStrength;
        sm.uniforms.uDamping.value = Ci.damping;
        sm.uniforms.uMaxVelocity.value = Ci.maxVelocity;
        sm.uniforms.uMaxOffset.value = Ci.maxOffset;
        sm.uniforms.uCurlStrength.value = Uc.strength * Ci.curlStrength;
        sm.uniforms.uCurlRadius.value = ne;
        sm.uniforms.uCurlFalloff.value = Ci.curlFalloff;
        sm.uniforms.uNormalDirectionInfluence.value = Ci.normalDirectionInfluence;
        sm.uniforms.uRepelRandomness.value = Ci.repelRandomness;
        sm.uniforms.uClumpScale.value = Ci.clumpScale;
        sm.uniforms.uClumpContrast.value = Ci.clumpContrast;
        sm.uniforms.uClumpBoost.value = Ci.clumpBoost;
        sm.uniforms.uTipBias.value = Ci.tipBias;
        sm.uniforms.uClusterMemory.value = Ci.clusterMemory;
        sm.uniforms.uChainCoherence.value = Ci.chainCoherence;

        fm.uniforms.uFieldTex.value = sim.currentField.texture;
        fm.uniforms.uDelta.value = dt;
        fm.uniforms.uCursorNdc.value.copy(cursor.smoothNdc);
        fm.uniforms.uCursorVelocity.value.copy(cursor.velocity);
        fm.uniforms.uCursorInfluence.value = pointerInfluence;
        fm.uniforms.uViewportAspect.value = aspect;
        fm.uniforms.uViewportHeightPx.value = viewportH;
        fm.uniforms.uCoreRadius.value = Lr;
        fm.uniforms.uTailRadius.value = ir;
        fm.uniforms.uClumpScale.value = Ci.clumpScale;
        fm.uniforms.uClumpContrast.value = Ci.clumpContrast;
        fm.uniforms.uTipBias.value = Ci.tipBias;
        fm.uniforms.uClusterMemory.value = Ci.clusterMemory;
        fm.uniforms.uChainCoherence.value = Ci.chainCoherence;
        fm.uniforms.uTime.value = elapsed;

        // render field
        var prevRT = renderer.getRenderTarget();
        renderer.setRenderTarget(sim.nextField);
        renderer.render(sim.fieldScene, sim.orthoCam);
        renderer.setRenderTarget(prevRT);
        var tmpF = sim.currentField; sim.currentField = sim.nextField; sim.nextField = tmpF;
        sim.simMat.uniforms.uFieldTex.value = sim.currentField.texture;
        sim.fieldMat.uniforms.uFieldTex.value = sim.currentField.texture;

        // render state
        renderer.setRenderTarget(sim.nextState);
        renderer.render(sim.simScene, sim.orthoCam);
        renderer.setRenderTarget(prevRT);
        var tmpS = sim.currentState; sim.currentState = sim.nextState; sim.nextState = tmpS;

        // update interactionState uniforms for render passes
        var interactionTex = sim.currentState.texture;
        uniforms0.uInteractionState.value = interactionTex;
        uniforms1.uInteractionState.value = interactionTex;
      } else {
        // without sim, use fallback empty texture
        var fallback = new THREE.DataTexture(new Float32Array([0, 0, 0, 0]), 1, 1, THREE.RGBAFormat, THREE.FloatType);
        fallback.needsUpdate = true;
        // keep to avoid leaking, but just set once
        if (!uniforms0.uInteractionState.value) {
          uniforms0.uInteractionState.value = fallback;
          uniforms1.uInteractionState.value = fallback;
        }
      }

      // update render uniforms (V5/G5)
      for (var ui of [uniforms0, uniforms1]) {
        ui.uProgress.value = curProgress;
        ui.uDirection.value = direction;
        ui.uPointSize.value = (function () {
          var bi = Math.max(H / focusDistance, 1e-5);
          var er = THREE.MathUtils.clamp(Math.pow(bi / 750, 0.78), 0.48, 1.7);
          return 2.2 * er;
        })();
        ui.uViewportAspect.value = W / Math.max(H, 1);
        ui.uFocusDistance.value = focusDistance;
      }

      // render main scene with post-processing
      // For simplicity: if blur+noise disabled or sim not ready, just render normally
      // Post-processing: mimic Q5 — blur of defocus layers + noise
      var doBlur = false; // debug disable post
      var doNoise = false;
      if (!doBlur && !doNoise) {
        renderer.setRenderTarget(null);
        renderer.clear();
        renderer.render(scene, camera);
      } else if (!doNoise) {
        // blur only: render scene to screen, then blur over
        renderer.setRenderTarget(null);
        renderer.clear();
        renderer.render(scene, camera);
        if (doBlur && post.oofTarget.width > 1) {
          // capture scene to oofTarget for blur (render again to offscreen)
          var prev = renderer.getRenderTarget();
          renderer.setRenderTarget(post.oofTarget);
          renderer.clear(true, true, false);
          renderer.render(scene, camera);
          // horizontal blur
          post.quad.material = post.blurMat;
          post.blurMat.uniforms.uTexture.value = post.oofTarget.texture;
          var bw = Math.max(1, post.oofTarget.width), bh = Math.max(1, post.oofTarget.height);
          var blurStrength = Math.max(Ya.blurStrength, 0);
          post.blurMat.uniforms.uDirection.value.set(blurStrength / bw, 0);
          renderer.setRenderTarget(post.blurA);
          renderer.clear(true, false, false);
          renderer.render(post.postScene, post.postCamera);
          // vertical blur
          post.blurMat.uniforms.uTexture.value = post.blurA.texture;
          post.blurMat.uniforms.uDirection.value.set(0, blurStrength / bh);
          renderer.setRenderTarget(post.blurB);
          renderer.clear(true, false, false);
          renderer.render(post.postScene, post.postCamera);
          // composite
          post.quad.material = post.compositeMat;
          post.compositeMat.uniforms.uTexture.value = post.blurB.texture;
          post.compositeMat.uniforms.uOpacity.value = Ya.blurOpacity;
          renderer.setRenderTarget(null);
          renderer.autoClear = false;
          renderer.render(post.postScene, post.postCamera);
          renderer.autoClear = true;
          post.quad.material = post.blurMat; // reset
        }
      } else {
        // with noise: render scene then copy to capture and apply noise
        renderer.setRenderTarget(null);
        renderer.clear();
        renderer.render(scene, camera);
        if (doBlur) {
          var prev2 = renderer.getRenderTarget();
          renderer.setRenderTarget(post.oofTarget);
          renderer.clear(true, true, false);
          renderer.render(scene, camera);
          post.quad.material = post.blurMat;
          post.blurMat.uniforms.uTexture.value = post.oofTarget.texture;
          var bw2 = Math.max(1, post.oofTarget.width), bh2 = Math.max(1, post.oofTarget.height);
          var bs = Math.max(Ya.blurStrength, 0);
          post.blurMat.uniforms.uDirection.value.set(bs / bw2, 0);
          renderer.setRenderTarget(post.blurA);
          renderer.clear(true, false, false);
          renderer.render(post.postScene, post.postCamera);
          post.blurMat.uniforms.uTexture.value = post.blurA.texture;
          post.blurMat.uniforms.uDirection.value.set(0, bs / bh2);
          renderer.setRenderTarget(post.blurB);
          renderer.clear(true, false, false);
          renderer.render(post.postScene, post.postCamera);
          post.quad.material = post.compositeMat;
          post.compositeMat.uniforms.uTexture.value = post.blurB.texture;
          post.compositeMat.uniforms.uOpacity.value = Ya.blurOpacity;
          renderer.setRenderTarget(null);
          renderer.autoClear = false;
          renderer.render(post.postScene, post.postCamera);
          renderer.autoClear = true;
        }
        // noise pass: copy framebuffer to texture then render noise composite
        var dpr = renderer.getPixelRatio();
        var size = renderer.getDrawingBufferSize(new THREE.Vector2());
        var cw = Math.max(1, Math.floor(size.x)), ch = Math.max(1, Math.floor(size.y));
        if (post.captureTex.image.width !== cw || post.captureTex.image.height !== ch) {
          try { post.captureTex.dispose(); } catch (e) { }
          var data = new Uint8Array(cw * ch * 4);
          post.captureTex = new THREE.DataTexture(data, cw, ch, THREE.RGBAFormat);
          post.captureTex.magFilter = THREE.NearestFilter; post.captureTex.minFilter = THREE.NearestFilter;
          post.captureTex.generateMipmaps = false;
          post.captureTex.needsUpdate = true;
        }
        // copy
        renderer.copyFramebufferToTexture(new THREE.Vector2(0, 0), post.captureTex);
        post.captureTex.needsUpdate = true;
        post.quad.material = post.noiseMat;
        post.noiseMat.uniforms.uTexture.value = post.captureTex;
        post.noiseMat.uniforms.uTime.value = elapsed;
        post.noiseMat.uniforms.uStrength.value = UE.strength;
        post.noiseMat.uniforms.uScale.value = UE.scale;
        post.noiseMat.uniforms.uSpeed.value = UE.speed;
        renderer.setRenderTarget(null);
        renderer.autoClear = false;
        renderer.render(post.postScene, post.postCamera);
        renderer.autoClear = true;
        post.quad.material = post.blurMat;
      }
    }
    animate();
    el.classList.add('vanilla-mounted');
    el._vanillaModels = activeModels;

    return {
      unmount: function () {
        running = false; if (raf) cancelAnimationFrame(raf);
        try { renderer.domElement.removeEventListener('pointermove', onPointerMove); renderer.domElement.removeEventListener('pointerdown', onPointerMove); } catch (e) { }
        try { window.removeEventListener('resize', onResize); } catch (e) { }
        try { if (ro) ro.disconnect(); } catch (e) { }
        try { if (mo) mo.disconnect(); } catch (e) { }
        try { document.removeEventListener('visibilitychange', onVisibility); } catch (e) { }
        try { disposeSim(sim); } catch (e) { }
        try { post.quadGeom.dispose(); post.blurMat.dispose(); post.compositeMat.dispose(); post.noiseMat.dispose(); post.oofTarget.dispose(); post.blurA.dispose(); post.blurB.dispose(); post.captureTex.dispose(); post.postScene.remove(post.quad); } catch (e) { }
        try { geom.dispose(); mat0.dispose(); mat1.dispose(); } catch (e) { }
        try { renderer.dispose(); } catch (e) { }
        try { if (renderer.domElement && renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement); } catch (e) { }
        el.classList.remove('vanilla-mounted');
      }
    };
  }

  window.ParticleHeroVanilla = {
    mount: function (el, opts) {
      opts = opts || {};
      var handle = null, cancelled = false;
      var pending = { unmount: function () { cancelled = true; if (handle && handle.unmount) handle.unmount(); } };
      loadThree(function (THREE) {
        if (cancelled) return;
        loadPCL(function (PCL) {
          if (cancelled) return;
          try {
            handle = createVanillaHandle(el, THREE, PCL, opts);
            pending.unmount = handle.unmount.bind(handle);
            pending._real = handle;
            if (opts.onReady) opts.onReady(handle);
          } catch (e) { if (opts.onError) opts.onError(e); else console.warn('[vanilla-hero]', e); }
        }, function (e) { if (opts.onError) opts.onError(e); });
      }, function (e) { if (opts.onError) opts.onError(e); });
      return pending;
    }
  };
})();
