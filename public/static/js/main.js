
import 'https://unpkg.com/react@18/umd/react.production.min.js';
import 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js'
import '/vendor/axios/dist/axios.min.js';


const AUTHOR = { ME: 'ME', BOT: 'BOT' } 
const AppId = () => {
  const [showHideChat, setShowHideChat ] = React.useState(false)
  const [showChat, setShowChat ] = React.useState(false)
  const [loading, setLoading ] = React.useState(false)
  const [messageList, setMessageList ] = React.useState([])
  const [ message, setMessage ] = React.useState('')

  const sendMessage = async (message) => {
    const messageListLocal = [...messageList]
    messageListLocal.push({author: AUTHOR.ME, name: 'Me', message })
    setMessageList([...messageListLocal ])

    // Do not launch multiple calls
    if( loading ) return
    setLoading(true)
    const conversation_history = messageListLocal.map( item => item.message)
    conversation_history.pop()
    const body = {
      data: {
        type: "recommendation",
        attributes: {
          product_type: message,
          conversation_history
        }
      }
    }
    const base_url = window.base_url?window.base_url:"https://apid.duckdns.org"

    const response = await axios.post(`${base_url}/api/chat`, body)    
    const json_response = response.data.data.attributes
    messageListLocal.push({author: AUTHOR.BOT, message: json_response.body, name: json_response.name})

    setMessageList(messageListLocal)
    setLoading(false)
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
      return 'show-chat d-flex flex-column chat-container'

    if( showChat === false ){
      if (showHideChat === true){
        return 'hide-chat d-flex flex-column chat-container'
      }else{
        return 'd-none'
      }
    }
  }


  return <div style={{ position: 'relative' }}>
            <section role="button" className={showChat?'d-none':'chat-icon'}
              onClick={() => setShowChat(true)} style={{ zIndex: "100" }}>
              <img src="/static/img/logomin.png" alt=""></img>
            </section>  

            <section className={getClass()} style={{ maxWidth: "90%", maxHeight: "90%", zIndex: "100"}}>

              <div className='d-flex align-items-center'>
                <div className='flex-grow-1 text-center'>
                  <img src="/static/img/logo.png" height={40} width={130} alt=''></img>
                </div>
                <i class="fa fa-times" aria-hidden="true" onClick={() => onHideChat()}></i>
              </div>
              <div className='flex-grow-1 mt-3 mb-3 rcv-msg-container' style={{ overflowY: 'auto'}}>
                
                {messageList.map( (item,idx) =>
                <div key={idx} className='mt-3 pe-2'>
                  <div className={`w-100 ${item.author === AUTHOR.BOT?'text-end':'text-start'}`}>
                    <b>{item.name} says:</b>
                  </div>
                  <div style={{ textAlign:'justify' }} key={idx}>{item.message}</div>
                </div>)}

              </div>
              {loading?
              <div className="d-flex justify-content-end align-items-end">
                <img src="/static/img/spinner.svg" alt="" style={{ height: '60px'}}></img>
              </div>
              :null}
              <div className='d-flex align-items-center justify-content-center input-msg-container'>
                <input value={message}
                  className="input-msg" type="text" 
                  onChange={(e) => setMessage(e.target.value)} 
                  onKeyDown={(e) => onKeyDownMessage(e)}/>
                
                <div className="d-flex align-items-center input-msg-enter"  role='button' onClick={() => onClickSendMessage()}>
                  <i class="fa fa-square-caret-right" aria-hidden="true"></i>                  
                </div>

              </div>

            </section>

        </div>
}

// *******************
// AppID Entry point
// *******************
const myInitCode = () => {

  // Creating container
  var iDiv = document.createElement('div');
  iDiv.id = 'apid';
  iDiv.className = 'apid';
  document.getElementsByTagName('body')[0].appendChild(iDiv);

  
  const root = ReactDOM.createRoot(document.querySelector('#apid'));
  root.render(<AppId />);

}

// See: https://stackoverflow.com/questions/39993676/code-inside-domcontentloaded-event-not-working
if (document.readyState !== 'loading')  myInitCode();
else document.addEventListener('DOMContentLoaded', () => myInitCode() );


