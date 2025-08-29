# 🌌 WebXR AR Solar System

An immersive augmented reality solar system experience built with React, Three.js, and WebXR. Explore planets right on your table using your mobile device's camera!

## ✨ Features

- **🚀 AR Mode**: Place and explore the solar system on any flat surface
- **🌍 Interactive Planets**: Click on planets to learn more about them
- **🎯 Hit Testing**: Precise placement of the solar system using AR hit testing
- **📱 Mobile Optimized**: Responsive design for mobile and tablet devices
- **🌟 Realistic Orbits**: Planets orbit the sun with accurate relative speeds
- **💍 Saturn's Rings**: Beautiful ring system around Saturn
- **🎨 3D Mode**: Fallback 3D mode for non-AR devices

## 🛠️ Technologies Used

- **React 19.1.1** - Modern UI framework with hooks
- **React Three Fiber 9.3.0** - React renderer for Three.js
- **Three.js 0.179.1** - 3D graphics library
- **@react-three/drei 10.7.4** - Utility components for R3F
- **WebXR API** - Browser standard for AR/VR experiences
- **WebXR Polyfill 2.0.3** - Fallback support for non-WebXR browsers

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn
- HTTPS server (required for WebXR)
- WebXR-compatible device (Android Chrome, iOS Safari 13+)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sudhei02/webxr-ar-solar-system.git
   cd webxr-ar-solar-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Access via HTTPS**
   - For local testing: Use `https://localhost:3000` (you may need to accept security warnings)
   - For mobile testing: Use tools like `ngrok` or deploy to a hosting service

## 📱 Device Compatibility

### ✅ Supported Devices

- **Android**: Chrome 79+ with ARCore support
- **iOS**: Safari 13+ (limited WebXR support)
- **Desktop**: Chrome/Edge with WebXR Device API

### 🔧 AR Requirements

- Camera permission
- Motion sensors access
- Flat, well-lit surface for hit testing
- Sufficient lighting for camera tracking

## 🎮 How to Use

### AR Mode
1. **Tap "🚀 Start AR"** button
2. **Grant permissions** for camera and motion sensors
3. **Point your device** at a flat surface (table, floor)
4. **Look for the orange reticle** indicating a detected surface
5. **The solar system appears** automatically on the detected surface
6. **Tap planets** to learn more about them
7. **Move around** to explore from different angles

### 3D Mode (Fallback)
1. **Drag to rotate** the view around the solar system
2. **Scroll to zoom** in and out
3. **Click planets** for information panels

## 🏗️ Project Structure

```
src/
├── components/
│   └── ARSolarSystem.js       # Main AR component with planets
├── hooks/
│   └── useARSession.js        # WebXR session management
├── utils/
│   └── WebXRUtils.js          # WebXR utility functions
├── App.js                     # Main app component
├── App.css                    # App-wide styles
└── index.js                   # React app entry point

public/
├── index.html                 # HTML template with WebXR polyfill
├── manifest.json              # PWA manifest
└── ...                        # Static assets
```

## 🔧 Configuration

### WebXR Features
The app requests these WebXR features:
- `hit-test` (required) - For surface detection
- `dom-overlay` (optional) - For UI overlay in AR

### Planet Data
Planets are configured in `ARSolarSystem.js`:
- Size, distance, orbital speed
- Colors and materials
- Information text

## 🚢 Deployment

### Production Build
```bash
npm run build
```

### HTTPS Requirement
WebXR requires HTTPS. Deploy to:
- **Vercel**: `vercel --prod`
- **Netlify**: Drag `build` folder to Netlify
- **GitHub Pages**: Use `gh-pages` package
- **Firebase**: `firebase deploy`

### Mobile Testing
Use ngrok for local HTTPS testing:
```bash
npm install -g ngrok
npm start
# In another terminal:
ngrok http 3000
```

## 🐛 Troubleshooting

### AR Not Working
- **Check HTTPS**: WebXR requires secure contexts
- **Verify device support**: Not all devices support AR
- **Grant permissions**: Camera and motion sensors needed
- **Check lighting**: Good lighting improves tracking
- **Try different surface**: Use a textured, flat surface

### Common Issues
- **"AR not supported"**: Device lacks WebXR/ARCore support
- **Reticle not appearing**: Poor lighting or unsuitable surface
- **Performance issues**: Try closing other browser tabs
- **iOS limitations**: Safari has limited WebXR support

## 🛡️ Browser Support

| Browser | Desktop | Mobile | AR Support |
|---------|---------|--------|------------|
| Chrome  | ✅      | ✅     | ✅         |
| Safari  | ✅      | ✅     | ⚠️ Limited |
| Firefox | ✅      | ✅     | ❌         |
| Edge    | ✅      | ✅     | ✅         |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **WebXR Samples** - Reference implementations
- **React Three Fiber** - Amazing React-Three.js integration
- **Three.js Community** - Excellent 3D library and ecosystem
- **WebXR Working Group** - Standardizing AR/VR for the web

## 📚 Resources

- [WebXR Device API](https://www.w3.org/TR/webxr/)
- [React Three Fiber Documentation](https://docs.pmnd.rs/react-three-fiber)
- [Three.js Documentation](https://threejs.org/docs/)
- [WebXR Samples](https://immersive-web.github.io/webxr-samples/)
