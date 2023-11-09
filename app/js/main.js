
// import 'https://unpkg.com/react@18/umd/react.production.min.js';
// import 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js'
// import '/vendor/axios/dist/axios.min.js';

import React, {useEffect} from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios/dist/axios.min.js';
import { v4 as uuidv4 } from 'uuid';


const AUTHOR = { ME: 'ME', BOT: 'BOT' } 
const AppId = () => {
  const [showHideChat, setShowHideChat ] = React.useState(false)
  const [showChat, setShowChat ] = React.useState(false)
  const [loading, setLoading ] = React.useState(false)
  const [messageList, setMessageList ] = React.useState([])
  const [ message, setMessage ] = React.useState('')
  const conversationIdRef = React.useRef( uuidv4() )
  const conversationContainer = React.useRef()

  const refreshSessionStorage = (messageList) => {
    const apid = {
      conversation_id: conversationIdRef.current,
      conversation_history: messageList
    }
    sessionStorage.setItem('apid', JSON.stringify(apid))
  }

  const sendMessage = async (message) => {
    const messageListLocal = [...messageList]
    messageListLocal.push({author: AUTHOR.ME, name: 'Me', message })
    setMessageList([...messageListLocal ])

    // Update sessionStorage
    refreshSessionStorage(messageListLocal)

    // Do not launch multiple calls
    if( loading ) return
    setLoading(true)
    // const conversation_history = messageListLocal.map( item => item.message)
    // conversation_history.pop()
    const body = {
      data: {
        type: "recommendation",
        attributes: {
          conversation_id: conversationIdRef.current,
          product_type: message
        }
      }
    }
    const base_url = window.base_url?window.base_url:"https://apid.duckdns.org"

    const response = await axios.post(`${base_url}/api/chat`, body)    
    const json_response = response.data.data.attributes
    messageListLocal.push({author: AUTHOR.BOT, message: json_response.body, name: json_response.name})

    setMessageList(messageListLocal)
    setLoading(false)


    // Update sessionStorage
    refreshSessionStorage(messageListLocal)
  }


  const onHideChat = () => {
    setShowHideChat(true)
    setShowChat(false)
    setTimeout( () => {
      setShowHideChat(false)
    }, 200)
  }

  const onKeyDownMessage = (e) => {
    if( e.key === 'Enter'){
      setMessage('')            
      sendMessage(message)
    }
  }

  const onClickSendMessage = () => {
    setMessage('')        
    sendMessage(message)
  }

  const getClass = () => {

    if( showChat === true )
      return 'show-chat appid-d-flex appid-flex-column chat-container'

    if( showChat === false ){
      if (showHideChat === true){
        return 'hide-chat appid-d-flex appid-flex-column chat-container'
      }else{
        return 'appid-d-none'
      }
    }
  }

  useEffect( () => {
    const apid_str = sessionStorage.getItem('apid')
    
    if( apid_str && apid_str.length > 0 ){
      const apid = JSON.parse(apid_str)
      conversationIdRef.current = apid.conversation_id
      setMessageList( apid.conversation_history )
      setShowChat(true)
    }
  }, [])

  useEffect( () => {
    const scrollHeight = conversationContainer.current.scrollHeight;
    const height = conversationContainer.current.clientHeight;
    const maxScrollTop = scrollHeight - height;
    conversationContainer.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
  }, [messageList])

  return <div style={{ position: 'relative' }}>
            <section role="button" className={showChat?'appid-d-none':'chat-icon'}
              onClick={() => setShowChat(true)} style={{ zIndex: "3000" }}>
              <img src="https://apid.duckdns.org/apid/img/logomin.png" alt=""></img>
            </section>  

            <section className={getClass()} style={{ maxWidth: "90%", maxHeight: "90%", zIndex: "3000"}}>
              <div className='appid-d-flex appid-align-items-center'>
                <div className='appid-flex-grow-1 appid-text-center'>
                  <img src="https://apid.duckdns.org/apid/img/logo.png" height={40} width={130} alt=''></img>
                </div>
                <i role="button" className="fa fa-times" aria-hidden="true" onClick={() => onHideChat()}></i>
              </div>
              <div ref={conversationContainer} className='appid-flex-grow-1 appid-mt-3 appid-mb-3 rcv-msg-container' style={{ overflowY: 'auto'}}>
                {messageList.map( (item,idx) =>
                <div key={idx} className='appid-mt-3 appid-pe-2'>
                  <div className={`w-100 ${item.author === AUTHOR.BOT?'appid-text-end':'appid-text-start'}`}>
                    <b>{item.name} says:</b>
                  </div>
                  <div style={{ textAlign:'justify' }} key={idx}>{item.message}</div>
                </div>)}
              </div>
              {loading?
              <div className="appid-d-flex appid-justify-content-end appid-align-items-end">
                <img src="https://apid.duckdns.org/apid/img/spinner.svg" alt="" style={{ height: '60px'}}></img>
              </div>
              :null}
              <div className='appid-d-flex appid-align-items-center appid-justify-content-center input-msg-container'>
                <input value={message}
                  className="input-msg" type="text" 
                  onChange={(e) => setMessage(e.target.value)} 
                  onKeyDown={(e) => onKeyDownMessage(e)}/>
                
                <div className="appid-d-flex appid-align-items-center input-msg-enter"  role='button' onClick={() => onClickSendMessage()}>
                  <i className="fa fa-square-caret-right" aria-hidden="true"></i>                  
                </div>

              </div>

            </section>

        </div>
}

// *******************
// AppID Entry point
// *******************
const injectCSSFiles = (href) => {
  const head  = document.getElementsByTagName('head')[0];
  const linkFontawesome  = document.createElement('link');
  linkFontawesome.rel  = 'stylesheet';
  linkFontawesome.type = 'text/css';
  linkFontawesome.href = href;
  linkFontawesome.media = 'all';
  head.appendChild(linkFontawesome);
}

const myInitCode = () => {

  // Creating container
  const appIdContainer = document.createElement('div');
  appIdContainer.id = 'apid';
  appIdContainer.className = 'apid';
  document.getElementsByTagName('body')[0].appendChild(appIdContainer);

  // Rendering appID
  const root = ReactDOM.createRoot(document.querySelector('#apid'));
  root.render(<AppId />);

}

// See: https://stackoverflow.com/questions/39993676/code-inside-domcontentloaded-event-not-working
if (document.readyState !== 'loading') {
  console.log('document is already ready, just execute code here');
  myInitCode();
} else {
  document.addEventListener('DOMContentLoaded', function () {
      console.log('document was not ready, place code here');
      myInitCode();
  });
}


