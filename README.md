# 🎵 Music Player - React Native Intern Assignment

=======
# Music Player - React Native Intern Assignment
```
It music streaming app built with React Native + Expo, featuring persistent playback, offline downloads, and many more.

NOTE :: If the app doesnot show show any songs the api has deprecated  please check the api once the api is deprecated sometimes
```

## Project Setup
```
git clone <repo-url> 
cd <project-name>

npm install

eas login

eas build --platform android --profile preview   --> for running on android device

Now Scan the QR and download the apk and you are good to use it 

```

## Featueres 
```
1. Search Songs and Discovery songs
2. Full music player controls
3. Liked songs library
4. Offline Songs Download
5. Music Queue management
```

## Architecture 

### Flow Diagram
```
Screens → Components → Stores → Services → External APIs
``` 

### Layers

#### Router 
```
AppRouter manages NativeStack + BottomTabs navigation.
```
#### Screens
```
HomeScreen — discovery and search

SearchScreen — search experience

LibraryScreen — liked & downloaded songs

PlayerScreen — full player UI

QueueScreen — queue management
``` 
#### Components
```
SongCard — for playing songs

MiniPlayer — the bottom player
```

#### State Management
```
playerStore — for previous and next song

libraryStore — liked songs

searchStore — recent song searches
```

#### Services
```
baseAPI — handles API calls

playerService — singleton audio engine

storage — MMKV storage service

downloadService — offline downloads
```


## Design Decisions & Trade-offs

### Zustand vs Redux 
```
Benefits of Zuststand : Zustand is much more faster than redux and requires a very minimal set of setup requirements . Redux requires defining actions, reducers, and dispatch flow, which introduces significant coding overhead. Zustand uses a hook-based store where state and actions live together, reducing setup code by ~70–80% and improving productivity .

Trade-Off : Zustand is comapatively new so has a less ecosysyem support as compared to Redux also the Zustand is less powerful as compared to Redux
```

### MMKV v/s Asynchronous Storage 
```
Benefits of MMKV : MMKV is a high-performance key-value storage library for mobile apps that provides fast, synchronous local storage. MMKV is synchronous , extreamely fast and is best for frequent read operations.

Trade-Off : MMKV has native dependency and requires native installation and can be tricky with Expo setups and MMKV is mainly movile focused while Asynchronous storage is platform independent
```

## Drive Link : 
```
Please see this folder this folder contains all the details : 
Drive link : https://drive.google.com/drive/folders/1GSDtk9cS9ZwcifT3AAZImhC4k5wRJcga?usp=sharing
```
