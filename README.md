# React Native Lexical Prototype With Mentions

This repository is part of the research for [Mentions App](https://mentions.cc/).

<image src="demo.gif" height="640" />

The goal here is building hyper-hybrid chat interfaces that work across both mobile and web platforms, with rich text formatting based on Lexical.

This is a prototype showing how to integrate a full Rich text editor on React Native, by leveraging the Webview, and Lexical as the text editor framework.
What makes this approach great is the use of [WebViewBridge](https://gronxb.github.io/webview-bridge/) 
which makes the communication and state sharing between host (native) and client (webview) typesafe with minimal effort.

A great addition to this repository is the possibility of resizing the webview's height according to it's content size, making it possible to use as a
simple "TextInput" for chat interfaces.

This example also contains a Suggestion plugin that presents mentions suggestions as a native view, instead of a popover rendered inside the WebView.

## How to run

First, prebuild the iOS and android projects by using:

```bash
npx expo prebuild
```
then, run the app:

```bash
npm i
npm run ios
```

If you want to change the editor code and see changes applied in real time:

```bash
cd lexical-editor
npm run dev
```

