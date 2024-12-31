import React from 'react';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux';
import { store } from './app/store'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import './index.css';
import App from './App.jsx';
import Register from './components/Login/Register.jsx';
import Intro from './components/Login/Intro.jsx';
import Genres from './components/Genres/Genres.jsx';
import Layout from './components/Layout/Layout.jsx';
import Profile from './components/Profile/Profile.jsx';
import GenreMatch from './components/Genres/GenreMatch.jsx';
import Chat from './components/Chat/Chat.jsx';
import HomePage from './components/Home/Homepage.jsx';
import ProfileSection from './components/Profile/ProfileSection.jsx';
import ChatList from './components/Chat/ChatList.jsx';


const router = createBrowserRouter([
  {
    path : '/',
    element :(
      <Layout>
        <HomePage/>
      </Layout>
    )
  },
  {
    path :'/login',
    element :(
      <Layout>
        <App/>
      </Layout>
    )
  },
  {
    path : '/register',
    element :(
      <Layout>
        <Register/>
      </Layout>
    )
  },
  {
    path : '/register/intro',
    element :(
      <Layout>
        <Intro/>
      </Layout>
    )
  },{
    path : '/user/genre',
    element :(
      <Layout>
        <Genres/>
      </Layout>
    )
  },
  {
    path : '/user/profile/:user',
    element :(
      <Layout>
        <ProfileSection/>
      </Layout>
    )
  },
  {
    path : '/user/genre-matching',
    element :(
      <Layout>
        <GenreMatch/>
      </Layout>
    )
  },
  {

    path : '/chat',
    element : (
      <Layout>
        <ChatList/>
      </Layout>
    )
  },
  {
    path : '/chat/:id',
    element : (
      <Layout>
        <Chat/>
      </Layout>
    )
  },
  {
    path : '/homepage',
    element : (
      <Layout>
        <HomePage/>
      </Layout>
    )
  }
])

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
    <RouterProvider router={router} />
    </Provider>
)
