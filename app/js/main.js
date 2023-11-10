
// import 'https://unpkg.com/react@18/umd/react.production.min.js';
// import 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js'
// import '/vendor/axios/dist/axios.min.js';

import React, {useEffect, useState, useRef} from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios/dist/axios.min.js';
import { v4 as uuidv4 } from 'uuid';
import useWebSocket, { ReadyState } from 'react-use-websocket';


const AUTHOR = { ME: 'ME', BOT: 'BOT' } 
const CHAT_MODE = { MINIFIED: 'MINIFIED', STANDARD: 'STANDARD', MAXIFIED: 'MAXIFIED'}
const AppId = () => {
  const [showHideChat, setShowHideChat ] = useState(false)
  const [chatMode, setChatMode ] = useState(CHAT_MODE.MINIFIED)
  const [loading, setLoading ] = useState(false)
  const [ messageList, setMessageList ] = useState([])
  const [ message, setMessage ] = useState('')
  const conversationIdRef = useRef( uuidv4() )
  const conversationContainer = useRef()
  const [socketUrl, setSocketUrl] = useState('wss://apid.duckdns.org/ws/chat');
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);
  const messageOngoing = useRef(false)

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  const refreshSessionStorage = (messageList) => {
    const apid = {
      conversation_id: conversationIdRef.current,
      conversation_history: messageList
    }
    sessionStorage.setItem('apid', JSON.stringify(apid))
  }

  const apiMessage = async (message) => {
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
    messageListLocal.push({author: AUTHOR.BOT, message: json_response.body, name: json_response.name, html:''})

    setMessageList(messageListLocal)
    setLoading(false)


    // Update sessionStorage
    refreshSessionStorage(messageListLocal)
  }

  const wsMessage = async (message) => {
    const messageListLocal = [...messageList]
    messageListLocal.push({author: AUTHOR.ME, name: 'Me', message })
    setMessageList([...messageListLocal ])

    // Update sessionStorage
    refreshSessionStorage(messageListLocal)

    // Do not launch multiple calls
    if( loading ) return
    setLoading(true)
    const body = {
      data: {
        type: "recommendation",
        attributes: {
          conversation_id: conversationIdRef.current,
          product_type: message
        }
      }
    }
    console.log("body ", body)
    sendMessage(JSON.stringify(body))
    messageListLocal.push({
        author: AUTHOR.BOT, 
        message: "", 
        name: 'Bot', 
        html: '<div>test</div>'
    })
    setMessageList(messageListLocal)



    // Update sessionStorage
    refreshSessionStorage(messageListLocal)
  }

  const onHideChat = () => {
    setShowHideChat(true)
    setChatMode(CHAT_MODE.MINIFIED)
    setTimeout( () => {
      setShowHideChat(false)
    }, 200)
  }

  const onKeyDownMessage = (e) => {
    if( e.key === 'Enter'){
      setMessage('')            
      //apiMessage(message)
      wsMessage(message)
    }
  }

  const onClickSendMessage = () => {
    setMessage('')        
    //apiMessage(message)
    wsMessage(message)
  }

  const getClass = () => {

    if( chatMode===CHAT_MODE.STANDARD )
      return 'show-chat appid-d-flex appid-flex-column chat-container'

    if( chatMode===CHAT_MODE.MAXIFIED )
      return 'show-chat appid-d-flex appid-flex-column chat-container-maxified'

    if( chatMode===CHAT_MODE.MINIFIED ){
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
      setChatMode(CHAT_MODE.STANDARD)
    }
  }, [])

  useEffect( () => {
    const scrollHeight = conversationContainer.current.scrollHeight;
    const height = conversationContainer.current.clientHeight;
    const maxScrollTop = scrollHeight - height;
    conversationContainer.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
  }, [messageList])

  // const isJSON = (str) => {
  //   try {      
  //     const json_str = JSON.parse(str.replace(/"/g, ""));
  //     return true;
  //   } catch (e) {
  //     return false;
  //   }
  // }

  useEffect(() => {
    if (lastMessage != null) {
      console.log("lastMessage.data ", lastMessage.data)
      let lastMessageStr = lastMessage.data.replace(/"/g, "")
      // Check message type
      if(/[end=[0-9]*]\\n/.test(lastMessageStr) ){
        messageOngoing.current = false
        setLoading(false)
      }else if(/[start=[0-9]*]\\n/.test(lastMessageStr)){
        messageOngoing.current = true     
      // }else if(isJSON(lastMessage.data)){
      //   // Do nothing
      }else if(/{*}/.test(lastMessage.data)){
        // mark message started
        if(Object.keys(JSON.parse(lastMessage.data)).length == 0)
          messageOngoing.current = true
      }else{
        const messageListLocal = JSON.parse(JSON.stringify(messageList))
        const currentMessageLocal = messageListLocal[messageListLocal.length-1]
        if(lastMessageStr == '\n') lastMessageStr = "<br></br>";
        currentMessageLocal.message = currentMessageLocal.message + lastMessageStr
        setMessageList( messageListLocal )
        // mark message ended
        messageOngoing.current = false

        // Update sessionStorage
        refreshSessionStorage(messageListLocal)
      }
        
    }
  }, [lastMessage]);

  const Card = () => {
    return <div className='p-3' style={{ background: '#E6E6E6', borderRadius: '5px'}}>
              <div>
                <div><b>New Balance FuelCell</b></div>
                <b>349.95€</b>
              </div>
              <div className='d-flex mt-2'>
                <div className='w-50' style={{ fontSize:'12px'}}>                
                  <div className='w-100 multiline-ellipsis' style={{ textAlign: 'justify'}}>                
                    Formerly named the FuelCell RC Elite, The FuelCell SuperComp Elite V3 is built for speed and is the pinnacle model of the SuperComp family. The SC Elite V3 is built around Energy Arc. Energy Arc technology features a unique bowed carbon fiber plate geometry with a strategic void in the midsole to deliver exceptionally high levels of energy return. This technology delivers a smoother and faster ride compared to previous models.
                  </div>
                  <div className="d-flex justify-content-between align-items-center" style={{ color: '#F8D64E'}}>
                    <i className='fa-solid fa-star'></i>
                    <i className='fa-solid fa-star'></i>
                    <i className='fa-solid fa-star'></i>
                    <i className='fa-solid fa-star'></i>
                    <i className='fa-regular fa-star'></i>
                    <div style={{ color: 'black'}}>(4/5)</div>                            
                  </div>
                  <small>31 votes</small>
                </div>
                <div className='w-50 text-center d-flex justify-content-center align-items-center ps-3'>
                  <img className="appid-w-100" style={{ borderRadius: '5px', border: '2px solid #B3B3B3'}}
                    src="https://img.runningwarehouse.com.au/watermark/rs.php?path=NSCE3M7-1.jpg&nw=210"></img>                        
                </div>
              </div>
            </div>
  }

  return <div style={{ position: 'relative' }}>
            <section role="button" className={chatMode===CHAT_MODE.MINIFIED?'chat-icon':'appid-d-none'}
              onClick={() => setChatMode(CHAT_MODE.STANDARD)} style={{ zIndex: "3000" }}>
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
                  <div style={{ textAlign:'justify' }} key={idx}>
                    <div dangerouslySetInnerHTML={{__html: item.message}} />
                  </div>
                  {/* <div className='appid-w-100 appid-mt-3'>
                    <div className='d-flex'>
                      <div className='w-50 me-1'>
                        <Card />
                      </div>
                      <div className='ms-1 w-50'>
                        <Card />
                      </div>
                    </div>
                    <div className='d-flex mt-1'>
                      <div className='w-50 me-1'>
                        <Card />
                      </div>
                      <div className='ms-1 w-50'>
                        <Card />
                      </div>
                    </div>
                  </div> */}
                </div>)}
              </div>
              
              <div className={loading?"appid-d-flex appid-justify-content-end appid-align-items-end":"appid-invisible"}>
                <img src="https://apid.duckdns.org/apid/img/spinner.svg" alt="" style={{ height: '30px'}}></img>
              </div>
              
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


