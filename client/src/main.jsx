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
import GenreMatch from './components/Genres/GenreMatch.jsx';
import Chat from './components/Chat/Chat.jsx';
import HomePage from './components/Home/Homepage.jsx';
import ProfileSection from './components/Profile/ProfileSection.jsx';
import ChatList from './components/Chat/ChatList.jsx';
import ProfileSetting from './components/Profile/ProfileSetting.jsx';
import Error from './components/Error/Error.jsx';


const router = createBrowserRouter([
  {
    path : '/',
    element :(
      <Layout>
        <HomePage/>
      </Layout>
    ),
    errorElement : <Error/>
  },
  {
    path :'/login',
    element :(
        <App/>
    ),
    errorElement : <Error/>
  },
  {
    path : '/register',
    element :(
        <Register/>
    ),
    errorElement : <Error/>
  },
  {
    path : '/register/intro',
    element :(
      <Layout>
        <Intro/>
      </Layout>
    ),
    errorElement : <Error/>
  },{
    path : '/user/genre',
    element :(
      <Layout>
        <Genres/>
      </Layout>
    ),
    errorElement : <Error/>
  },
  {
    path : '/user/profile/:user',
    element :(
      <Layout>
        <ProfileSection/>
      </Layout>
    ),
    errorElement : <Error/>
  },
  {
    path : '/user/genre-matching',
    element :(
      <Layout>
        <GenreMatch/>
      </Layout>
    ),
    errorElement : <Error/>
  },
  {

    path : '/chat',
    element : (
      <Layout>
        <ChatList/>
      </Layout>
    ),
    errorElement : <Error/>
  },
  {
    path : '/chat/:id',
    element : (
      <Layout>
        <Chat/>
      </Layout>
    ),
    errorElement : <Error/>
  },
  {
    path : '/homepage',
    element : (
      <Layout>
        <HomePage/>
      </Layout>
    ),
    errorElement : <Error/>
  },
  {
    path : '/user/settings',
    element : (
      <Layout>
        <ProfileSetting/>
      </Layout>
    ),
    errorElement : <Error/>
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
    <RouterProvider router={router} />
    </Provider>
    </StrictMode>
)
