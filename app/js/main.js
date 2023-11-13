import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios/dist/axios.min.js';
import { v4 as uuidv4 } from 'uuid';
import useWebSocket, { ReadyState } from 'react-use-websocket';


const AUTHOR = { ME: 'ME', BOT: 'BOT' }
const CHAT_MODE = { MINIFIED: 'MINIFIED', STANDARD: 'STANDARD', MAXIFIED: 'MAXIFIED' }
const AppId = () => {
  const [showHideChat, setShowHideChat] = useState(false)
  const [chatMode, setChatMode] = useState(CHAT_MODE.MINIFIED)
  const [loading, setLoading] = useState(false)
  const [messageList, setMessageList] = useState([])
  const [message, setMessage] = useState('')
  const conversationIdRef = useRef(uuidv4())
  const conversationContainer = useRef()
  const [socketUrl, setSocketUrl] = useState('wss://apid.duckdns.org/ws/chat');
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);
  const messageOngoing = useRef(false)
  const wsWordList = useRef([])
  const productList = useRef(null)

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

  // const apiMessage = async (message) => {
  //   const messageListLocal = [...messageList]
  //   messageListLocal.push({author: AUTHOR.ME, name: 'Me', message })
  //   setMessageList([...messageListLocal ])

  //   // Update sessionStorage
  //   refreshSessionStorage(messageListLocal)

  //   // Do not launch multiple calls
  //   if( loading ) return
  //   setLoading(true)
  //   const body = {
  //     data: {
  //       type: "recommendation",
  //       attributes: {
  //         conversation_id: conversationIdRef.current,
  //         product_type: message
  //       }
  //     }
  //   }
  //   const base_url = window.base_url?window.base_url:"https://apid.duckdns.org"
  //   const response = await axios.post(`${base_url}/api/chat`, body)    
  //   const json_response = response.data.data.attributes
  //   messageListLocal.push({author: AUTHOR.BOT, message: json_response.body, name: json_response.name, html:''})

  //   setMessageList(messageListLocal)
  //   setLoading(false)

  //   // Update sessionStorage
  //   refreshSessionStorage(messageListLocal)
  // }

  const wsMessage = async (message) => {

    const mylocation = window.location.pathname
    const hash = window.location.hash

    console.log({ mylocation, hash })
    const messageListLocal = [...messageList]
    messageListLocal.push({ author: AUTHOR.ME, message, current_location: `${mylocation}${hash}` })
    setMessageList([...messageListLocal])

    // Update sessionStorage
    refreshSessionStorage(messageListLocal)

    // Do not launch multiple calls
    if (loading) return
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
    // console.log("body ", body)
    sendMessage(JSON.stringify(body))

    // // Update sessionStorage
    // refreshSessionStorage(messageListLocal)
  }

  const onHideChat = () => {
    setShowHideChat(true)
    setChatMode(CHAT_MODE.MINIFIED)
    setTimeout(() => {
      setShowHideChat(false)
    }, 200)
  }

  const onKeyDownMessage = (e) => {
    if (e.key === 'Enter') {
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

    if (chatMode === CHAT_MODE.STANDARD)
      return 'show-chat appid-d-flex appid-flex-column chat-container'

    if (chatMode === CHAT_MODE.MAXIFIED)
      return 'show-chat appid-d-flex appid-flex-column chat-container-maxified'

    if (chatMode === CHAT_MODE.MINIFIED) {
      if (showHideChat === true) {
        return 'hide-chat appid-d-flex appid-flex-column chat-container'
      } else {
        return 'appid-d-none'
      }
    }
  }

  useEffect(() => {
    const apid_str = sessionStorage.getItem('apid')

    if (apid_str && apid_str.length > 0) {
      const apid = JSON.parse(apid_str)
      conversationIdRef.current = apid.conversation_id
      setMessageList(apid.conversation_history)
      const is_maximised = apid.conversation_history.some(item => item.product_list.length > 0)
      if (is_maximised) setChatMode(CHAT_MODE.MAXIFIED)
      else setChatMode(CHAT_MODE.STANDARD)
    }
  }, [])

  useEffect(() => {
    const scrollHeight = conversationContainer.current.scrollHeight;
    const height = conversationContainer.current.clientHeight;
    const maxScrollTop = scrollHeight - height;
    conversationContainer.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
  }, [messageList, wsWordList.current.length])

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
      let lastMessageStr = lastMessage.data.replace(/"/g, "")
      console.log(`lastMessageStr '${lastMessageStr}'`)


      // Check message type
      if (/\[start=.*\]/.test(lastMessageStr) === true) {
        messageOngoing.current = true
        wsWordList.current.length = 0
      } else if (/\[end=.*\]/.test(lastMessageStr) === true) {
        messageOngoing.current = false
        setLoading(false)
      } else if (/{*}/.test(lastMessage.data)) {
        // Do nothing
        const body = JSON.parse(lastMessage.data)
        productList.current = body.product_list.slice(0, 4)
      } else {
        // Display messages
        if (lastMessageStr.includes('\\n')) lastMessageStr = "<br></br>";
        wsWordList.current.push(lastMessageStr)

        //mark message ended
        messageOngoing.current = false
      }
    }
  }, [lastMessage]);

  useEffect(() => {
    console.log("useEffect ", messageOngoing.current, wsWordList.current, productList.current)
    if (messageOngoing.current === false && wsWordList.current.length > 0) {
      const messageListLocal = [...messageList]
      messageListLocal.push({ author: AUTHOR.BOT, name: 'Bot', message: wsWordList.current.join(''), product_list: productList.current })
      setMessageList([...messageListLocal])
      if (productList.current.length > 0) setChatMode(CHAT_MODE.MAXIFIED)

      // Update sessionStorage
      refreshSessionStorage(messageListLocal)
      wsWordList.current.length = 0
    }
  }, [loading])

  const Card = (props) => {
    const starsOn = props.data.stars > 0 ? Math.floor(props.data.stars) : 0
    const starsOff = props.data.stars > 0 ? 5 - Math.floor(props.data.stars) : 5
    return <div className='p-3 h-100 d-flex flex-column' style={{ background: '#E6E6E6', borderRadius: '5px' }} role='button'
      onClick={() => window.location = props.data.url}>
      <div>
        <div><b>{props.data.title}</b></div>
        <b>{props.data.price}€</b>
      </div>
      <div className='d-flex mt-2 flex-grow-1'>
        <div className='w-50' style={{ fontSize: '12px' }}>
          <div className='w-100 multiline-ellipsis' style={{ textAlign: 'justify' }}>
            {props.data.description}
          </div>
          <div className="d-flex justify-content-between align-items-center" style={{ color: '#F8D64E' }}>
            {[...Array(starsOn)].map((item, idx) =>
              <i key={idx} className='fa-solid fa-star'></i>
            )}
            {[...Array(starsOff)].map((item, idx) =>
              <i key={idx} className='fa-regular fa-star'></i>
            )}
            <div style={{ color: 'black' }}>({starsOn}/5)</div>
          </div>
        </div>
        <div className='w-50 ps-3'>
          <img className="w-100" style={{ borderRadius: '5px', border: '2px solid #B3B3B3' }}
            src={props.data.image_link}></img>
        </div>
      </div>
    </div>
  }

  return <div style={{ position: 'fixed', bottom: 50, right: 50 }}>
    <section role="button"
      onClick={() => setChatMode(CHAT_MODE.STANDARD)} style={{ zIndex: "3000" }}>
      <img src="https://apid.duckdns.org/apid/img/logomin.png" alt=""  ></img>
    </section>


    <section className={getClass()}>
      <div style={{
        padding: "10px 15px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#212529"
      }}>
        <div >
          <img style={{ filter: "invert" }} src="https://apid.duckdns.org/apid/img/logo.png" height={20} width={80} alt='' />
        </div>
        <div>
          {/* {chatMode == CHAT_MODE.MAXIFIED ?
            <i role="button" className="fa-solid fa-minimize me-2" onClick={() => setChatMode(CHAT_MODE.STANDARD)} />
            :
            <i role="button" className="fa-solid fa-maximize me-2" onClick={() => setChatMode(CHAT_MODE.MAXIFIED)} />
          } */}
          <i role="button" className="fa fa-times" style={{ color: "#fff" }} aria-hidden="true" onClick={() => onHideChat()}></i>
        </div>
      </div>
      {/* <div style={{
        padding: "10px 15px",
        overflowY:"auto"
      }}> */}
      <div ref={conversationContainer} className='appid-flex-grow-1 appid-mt-3 appid-mb-3 rcv-msg-container' style={{ overflowY: 'auto', display: "flex", flexDirection: "column", gap: 15, padding: "10px 15px" }}>
        <div style={{
          background: "#eef2f3",
          color: "#000",
          padding: "10px 15px",
          borderRadius: 10,
          maxWidth: "80%",
          minWidth: "min-content",
          width: "fit-content",
          marginLeft: "auto"
        }}>
          <div className={`w-100 `}>
            <b>Bot says:</b>
          </div>
          <p style={{ margin: 0 }}>Hi! I'm your smart sales assistant, here to help and guide you through our store. Running shoes are our speciality. How can I assist you today?</p>
        </div>
        {messageList.map((item, idx) =>
          <div key={idx} style={{
            background: item.name.toUpperCase() === AUTHOR.ME ? "#4286f4" : "#eef2f3",
            color: item.name.toUpperCase() === AUTHOR.ME ? "#fff" : "#000",
            padding: "10px 15px",
            borderRadius: 10,
            maxWidth: "80%",
            minWidth: "min-content",
            width: "fit-content",
            marginLeft: item.name.toUpperCase() === AUTHOR.ME ? "auto" : "inherit"
          }}>
            <div className={`w-100 `}>
              <b>{item.name} says:</b>
            </div>
            <div style={{ textAlign: 'justify' }} key={idx}>
              <div dangerouslySetInnerHTML={{ __html: item.message }} />
            </div>
            {item.product_list.length > 0 && <div className='appid-w-100 appid-mt-3'>
              <div className='d-flex flex-wrap'>
                {item.product_list.map((item, idx) =>
                  <div className='w-50 p-1' key={idx}>
                    <Card data={item} />
                  </div>
                )}
              </div>
            </div>}
          </div>)}
        {loading && wsWordList.current.length > 0 ?
          <div style={{
            background: "#4286f4",
            color: "#fff",
            padding: "10px 15px",
            borderRadius: 10,
            maxWidth: "80%",
            minWidth: "min-content",
            width: "fit-content",
            marginLeft: "auto"
          }}>
            <div className={`w-100`}>
              <b>Bot says:</b>
            </div>
            <div style={{ textAlign: 'justify' }}>
              <div dangerouslySetInnerHTML={{ __html: wsWordList.current.join('') }} />
            </div>
          </div>
          : null}

      </div>

      {loading && <div className={"appid-d-flex appid-justify-content-end appid-align-items-end"}>
        <img src="https://apid.duckdns.org/apid/img/spinner.svg" alt="" style={{ height: '30px' }}></img>
      </div>}

      {/* </div> */}

      <div className='appid-d-flex ' style={{
        padding: "10px 15px"
      }}>
        <textarea value={message} disabled={loading}
          type="text"
          rows={3}
          style={{
            flexGrow: 1
          }}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => onKeyDownMessage(e)} />

        <div className="appid-d-flex appid-align-items-center " role='button' onClick={() => onClickSendMessage()}>
          <i className="fa fa-square-caret-right" aria-hidden="true" style={{
            fontSize: "2.2em"
          }} ></i>
        </div>

      </div>

    </section>

  </div>
}

// *******************
// AppID Entry point
// *******************
const injectCSSFiles = (href) => {
  const head = document.getElementsByTagName('head')[0];
  const linkFontawesome = document.createElement('link');
  linkFontawesome.rel = 'stylesheet';
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


