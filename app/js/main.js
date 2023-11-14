import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios/dist/axios.min.js';
import { v4 as uuidv4 } from 'uuid';
import useWebSocket, { ReadyState } from 'react-use-websocket';


const AUTHOR = { ME: 'ME', BOT: 'BOT' }
const CHAT_MODE = { MINIFIED: 'MINIFIED', STANDARD: 'STANDARD', MAXIFIED: 'MAXIFIED' }


const MediaRederingComponent = ({ type, mediaArrayElements, onClick }) => {
  switch (type) {
    case "product":
      return (
        <div>
          <p style={{
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "underline"
          }}>Related Products</p>
          <div style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
          }}>

            {mediaArrayElements.length > 0 ?
              mediaArrayElements.map(ele => (
                <a onClick={() => onClick({ url: ele.url })} style={{
                  display: "flex",
                  color: "inherit",
                  textDecoration: "none",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "48%",
                  boxShadow: "0 0 0 1px black",
                  marginBottom: 10,
                  marginRight: "2%",
                  background: "#fff",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "scale(-0.2)"
                  }
                }}>
                  <div style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 5,
                    width: "100%"
                  }}>
                    <p style={{
                      fontWeight: 500,
                      margin: 0,
                      marginBottom: 2,
                      fontSize: 10,
                      flex: 1
                    }}>{ele.title} <span style={{
                      background: "green",
                      padding: "0px 8px",
                      borderRadius: "50px",
                      color: "#fff",
                      fontWeight: 500
                    }}>{ele.discount}</span></p>
                    <p style={{
                      fontWeight: 700,
                      margin: 0,
                      marginBottom: 2,
                      fontSize: 14
                    }}>€{ele.price}</p>
                  </div>
                  <div style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}>

                    <div style={{
                      padding: 5
                    }}>
                      <p style={{
                        margin: 0,
                      }}>{ele.description.substring(0, 125)}...</p>
                    </div>

                    <div style={{
                      padding: 5
                    }}>
                      <img src={ele.image_link ? ele.image_link : ""} style={{ width: "100%" }} alt='Product Image ' />
                    </div>
                  </div>


                  <div style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 5,
                    width: "100%",
                    justifyContent: "space-between"
                  }}>
                    <div>
                      {[...Array(Math.floor(ele.stars))].map((item, idx) =>
                        <i key={idx} style={{ color: '#ffd700' }} className='fa-solid fa-star'></i>
                      )}
                      {[...Array(5 - Math.floor(ele.stars))].map((item, idx) =>
                        <i key={idx} className='fa-regular fa-star'></i>
                      )}&nbsp;
                      ({Math.floor(ele.stars)}/5)
                    </div>
                    <div style={{ color: 'black' }}>Colors: {ele.color.join(",")} </div>
                  </div>
                </a>
              ))
              : ""}
          </div>
        </div>
      )
      break;
    case "customer_review":
      return (
        <div style={{
          marginTop: 5
        }}>
          <p style={{
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "underline"
          }}>Customer Comments</p>
          <div style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}>
            {mediaArrayElements.length > 0 ?
              mediaArrayElements.map(ele => (
                <div style={{
                  display: "flex",
                  color: "inherit",
                  textDecoration: "none",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "98%",
                  boxShadow: "0 0 0 1px black",
                  marginBottom: 10,
                  background: "#fff",
                  "&:hover": {
                    transform: "scale(-0.2)"
                  }
                }}>
                  <div style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 5,
                    width: "100%"
                  }}>
                    <p style={{
                      fontWeight: 700,
                      margin: 0,
                      marginBottom: 2,
                      fontSize: 14,
                      flex: 1
                    }}>
                      <i class="fas fa-user-o"></i> &nbsp;
                      {ele.name}</p>
                    <p style={{
                      fontWeight: 700,
                      margin: 0,
                      marginBottom: 2,
                      fontSize: 14
                    }}>{ele.date}</p>
                  </div>
                  <div style={{
                    padding: 5
                  }}>
                    <p style={{
                      margin: 0,
                    }}>{ele.comment}</p>
                  </div>
                </div>
              ))
              : ""}
          </div>
        </div>
      )
      break;
    case "youtube":
      return (
        <div style={{
          marginTop: 5
        }}>
          {console.log("youtube url found")}
          <p style={{
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "underline"
          }}>Video Review Found</p>
          <div style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}>
            <iframe src={mediaArrayElements} alt={"Video URl"} style={{
              width: "250px",
              height: "250px"
            }} />
          </div>
        </div>
      )
      break;

    case "list":
      return (
        <div style={{
          marginTop: 5
        }}>
          {console.log("youtube url found")}
          <p style={{
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "underline"
          }}>Best Use</p>
          <div style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}>
            <ol>
              {mediaArrayElements.map(ele => (
                <li>{ele}</li>
              ))}
            </ol>
          </div>
        </div>
      )
      break;

    default:
      break;
  }
}


const AppId = () => {
  const [showHideChat, setShowHideChat] = useState(false)
  const [chatMode, setChatMode] = useState(CHAT_MODE.MINIFIED)
  const [loading, setLoading] = useState(false)
  const [messageList, setMessageList] = useState([])
  const [message, setMessage] = useState('')
  const [hasMedia, setHasMedia] = React.useState(false)
  const [isChatOpen, setIsChatOpen] = React.useState(false)

  const handleMediaVisited = async ({ url }) => {
    await wsMessage(`I am vieweing Product: ${url} `, false)
    window.location.assign(url)
  }

  const conversationIdRef = useRef(uuidv4())
  const conversationContainer = useRef()
  const [socketUrl, setSocketUrl] = useState('wss://apid.duckdns.org/ws/chat');
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);
  const messageOngoing = useRef(false)
  const wsWordList = useRef([])
  const productList = useRef(null)
  const customerComments = useRef(null)
  const keyFeatures = useRef(null)
  const bestUse = useRef(null)
  const surface = useRef(null)

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

  React.useEffect(() => {
    if (messageList.length > 0) {
      if (messageList.filter(m => m.product_list && m.product_list.length > 0).length > 0) {
        setHasMedia(true)
      }
    }

    if (messageList.length > 0) {
      if (messageList.filter(m => m.customer_review && m.customer_review.length > 0).length > 0) {
        setHasMedia(true)
      }
    }

    if (messageList.length > 0) {
      if (messageList.filter(m => m.youtube_url).length > 0) {
        setHasMedia(true)
      }
    }
  }, [messageList])

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

  const wsMessage = async (message, showInChat = true) => {

    const mylocation = window.location.pathname
    const hash = window.location.hash

    const messageListLocal = [...messageList]
    messageListLocal.push({ author: AUTHOR.ME, message, showInChat, current_location: `${mylocation}${hash}` })
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
          product_type: message,
          url: `${window.location.href}`
        }
      }
    }
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
      console.log("I am here")
      setIsChatOpen(true)
      const apid = JSON.parse(apid_str)
      conversationIdRef.current = apid.conversation_id
      setMessageList(apid.conversation_history)
      // const is_maximised = apid.conversation_history.some(item => item.product_list.length > 0)
      // if (is_maximised) setChatMode(CHAT_MODE.MAXIFIED)
      // else setChatMode(CHAT_MODE.STANDARD)
    }
  }, [])

  useEffect(() => {
    // console.log({conversationContainer})
   if(isChatOpen){
    const scrollHeight = conversationContainer.current.scrollHeight;
    const height = conversationContainer.current.clientHeight;
    const maxScrollTop = scrollHeight - height;
    conversationContainer.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
   }
  }, [messageList, wsWordList.current.length, isChatOpen])

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
      console.log({ "typeof": typeof (lastMessage), lastMessage: lastMessage.data })
      let lastMessageStr = lastMessage.data.replace(/"/g, "")
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
        console.log({ body: body })
        if (body.product_list) {
          productList.current = body.product_list
        }
        if (body.customer_comments) {
          customerComments.current = body.customer_comments
        }
        if (body.key_features) {
          keyFeatures.current = body.key_features
        }
        if (body.best_use) {
          bestUse.current = body.best_use
        }
        if (body.surface) {
          surface.current = body.surface
        }
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
    if (messageOngoing.current === false && wsWordList.current.length > 0) {
      const messageListLocal = [...messageList]
      messageListLocal.push({
        author: AUTHOR.BOT, name: 'Bot', message: wsWordList.current.join(''), product_list: productList.current, customer_comments: customerComments.current,
        key_features: keyFeatures.current,
        best_use: bestUse.current,
        surfaceF: surface.current,
        showInChat: true
      })
      setMessageList([...messageListLocal])
      // if (productList.current.length > 0) setChatMode(CHAT_MODE.MAXIFIED)

      // Update sessionStorage
      refreshSessionStorage(messageListLocal)
      wsWordList.current.length = 0
    }
  }, [loading])

  // const Card = (props) => {
  //   const starsOn = props.data.stars > 0 ? Math.floor(props.data.stars) : 0
  //   const starsOff = props.data.stars > 0 ? 5 - Math.floor(props.data.stars) : 5
  //   return <div className='p-3 h-100 d-flex flex-column' style={{ background: '#E6E6E6', borderRadius: '5px' }} role='button'
  //     onClick={() => window.location = props.data.url}>
  //     <div>
  //       <div><b>{props.data.title}</b></div>
  //       <b>{props.data.price}€</b>
  //     </div>
  //     <div className='d-flex mt-2 flex-grow-1'>
  //       <div className='w-50' style={{ fontSize: '12px' }}>
  //         <div className='w-100 multiline-ellipsis' style={{ textAlign: 'justify' }}>
  //           {props.data.description}
  //         </div>
  //         <div className="d-flex justify-content-between align-items-center" style={{ color: '#F8D64E' }}>
  //           {[...Array(starsOn)].map((item, idx) =>
  //             <i key={idx} className='fa-solid fa-star'></i>
  //           )}
  //           {[...Array(starsOff)].map((item, idx) =>
  //             <i key={idx} className='fa-regular fa-star'></i>
  //           )}
  //           <div style={{ color: 'black' }}>({starsOn}/5)</div>
  //         </div>
  //       </div>
  //       <div className='w-50 ps-3'>
  //         <img className="w-100" style={{ borderRadius: '5px', border: '2px solid #B3B3B3' }}
  //           src={props.data.image_link}></img>
  //       </div>
  //     </div>
  //   </div>
  // }

  return <div style={{ position: 'fixed', bottom: 50, right: 50 }}>
    <section role="button"
      onClick={() => {
        setChatMode(CHAT_MODE.STANDARD)
        setIsChatOpen(true)
      }} style={{ zIndex: "3000" }}>
      <img src="https://apid.duckdns.org/apid/img/logomin.png" alt=""  ></img>
    </section>


    {isChatOpen && <section className={'show-chat appid-d-flex appid-flex-column chat-container'} style={{
      maxWidth: hasMedia ? 700 : 300,
      width: hasMedia ? 700 : 300,
      minHeight: hasMedia ? 700 : 300,
      transform: hasMedia ? "width .3s ease" : "inherit"
    }}>
      <div style={{
        padding: "10px 15px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#212529"
      }}>
        <div >
          <img src="https://apid.duckdns.org/apid/img/logo.png" height={20} width={80} alt='' style={{ filter: "invert(1)" }} />
        </div>
        <div>
          {/* {chatMode == CHAT_MODE.MAXIFIED ?
            <i role="button" className="fa-solid fa-minimize me-2" onClick={() => setChatMode(CHAT_MODE.STANDARD)} />
            :
            <i role="button" className="fa-solid fa-maximize me-2" onClick={() => setChatMode(CHAT_MODE.MAXIFIED)} />
          } */}
          <i role="button" className="fa fa-times" style={{ color: "#fff" }} aria-hidden="true" onClick={() => setIsChatOpen(!isChatOpen)}></i>
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
          maxWidth: "90%",
          minWidth: "fit-content",
          width: "fit-content",
          marginLeft: "inherit",
          fontSize: 12,
        }}>
          <div style={{ marginBottom: 5 }} className={`w-100 `}>
            <b>Bot says:</b>
          </div>
          <p style={{ margin: 0 }}>Hi! I'm your smart sales assistant, here to help and guide you through our store. Running shoes are our speciality. How can I assist you today?</p>
        </div>
        {messageList.filter(item => item.showInChat).map((item, idx) =>
          <div key={idx} style={{
            background: item.author.toUpperCase() === AUTHOR.ME ? "#4286f4" : "#eef2f3",
            color: item.author.toUpperCase() === AUTHOR.ME ? "#fff" : "#000",
            padding: "10px 15px",
            borderRadius: 10,
            maxWidth: "90%",
            minWidth: "fit-content",
            width: "fit-content",
            marginLeft: item.author.toUpperCase() === AUTHOR.ME ? "auto" : "inherit",
            fontSize: 12,
          }}>
            <div style={{ marginBottom: 5 }} className={`w-100 `}>
              <b>{item.author.charAt(0).toUpperCase() + item.author.slice(1).toLowerCase()} says:</b>
            </div>
            <div style={{ textAlign: 'justify' }} key={idx}>
              <div dangerouslySetInnerHTML={{ __html: item.message }} />
            </div>

            {item.product_list && item.product_list.length > 0 && <div style={{
              marginTop: 5,
              marginBottom: 5
            }}><MediaRederingComponent type={"product"} mediaArrayElements={item.product_list} onClick={handleMediaVisited} /></div>}

            {item.best_use && item.best_use.length > 0 && <div style={{
              marginTop: 5,
              marginBottom: 5
            }}><MediaRederingComponent type={"list"} mediaArrayElements={item.best_use} onClick={{}} /></div>}

            {item.surface && item.surface.length > 0 && <div style={{
              marginTop: 5,
              marginBottom: 5
            }}><MediaRederingComponent type={"list"} mediaArrayElements={item.surface} onClick={{}} /></div>}

            {item.key_features && item.key_features.length > 0 && <div style={{
              marginTop: 5,
              marginBottom: 5
            }}><MediaRederingComponent type={"list"} mediaArrayElements={item.key_features} onClick={{}} /></div>}


            {item.customer_review && item.customer_review.length > 0 && <div style={{
              marginTop: 5,
              marginBottom: 5
            }}><MediaRederingComponent type={"customer_review"} mediaArrayElements={item.customer_review} onClick={handleMediaVisited} /></div>}


            {item.youtube_url && <div style={{
              marginTop: 5,
              marginBottom: 5
            }}><MediaRederingComponent type={"youtube"} mediaArrayElements={item.youtube_url} onClick={handleMediaVisited} /></div>}

          </div>)}
        {loading && wsWordList.current.length > 0 ?
          <div style={{
            background: "#eef2f3",
            padding: "10px 15px",
            borderRadius: 10,
            maxWidth: "80%",
            minWidth: "fit-content",
            width: "fit-content",
            marginLeft: "inherit",
          }}>
            <div className={`w-100`}>
              <b>Bot says:</b>
            </div>
            <div style={{ fontSize: 12 }} >
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
        padding: "10px 5px",
        borderTop: "1px solid #ccc"
      }}>
        <input value={message} disabled={loading}
          type="text"
          placeholder='Feel Free to ask me anything!'
          style={{
            flexGrow: 1,
            marginRight: "5px"
          }}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => onKeyDownMessage(e)} />

        <div className="appid-d-flex " style={{
          borderRadius: '50%',
          border: "1px solid #777",
          padding: 8,
          background: "rgb(33, 37, 41)",
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }} role='button' onClick={() => onClickSendMessage()}>
          <i className="fa fa-send" aria-hidden="true" style={{
            fontSize: "1.1em",
            color: "#fff"
          }} ></i>
        </div>

      </div>

    </section>}

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


