import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Pusher from "pusher-js";
import moment from "moment";

export default function Chat() {

  const [otherId, setOtherId] = useState();
  const [data, setData] = useState([]);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("Click a message to view");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [userData, setUserData] = useState(null)
  let pusher = useRef(null);
  let channel = useRef(null)

  useEffect(() => {
    if(userData){
      pusher = new Pusher("270a3d06afd3758b11ea", {
        cluster: "mt1",
        encrypted: true,
      });
     channel.current = pusher.subscribe(`message`);

    }
   
  }, [userData]);

  useEffect(() => {
    if(userData){
     if(!channel.current) return;
      channel.current.bind("message.sent", (chat) => {
        let newData = [...data, chat.message]
        setData(newData)
        getList();
       
      });
    }
   
  }, [userData, data, channel]);

  function getList() {
    if(!userData) return;
    axios
      .get(
        "http://localhost:8000/api/v1/get/message/users/list",

        {
          headers: {
            Authorization: `Bearer ${userData?.token}`,
          },
        }
      )
      .then((res) => {
        if (res.status === 200) {
          setList(res.data.data);
        
        }
      });
  }

  function getMessage(id, name) {
    setOtherId(id);
    setName(name);
    setLoading(true);
    axios
      .post(
        "http://localhost:8000/api/v1/get/message/history",
        { receiver_id: id },
        {
          headers: {
            Authorization: `Bearer ${userData?.token}`,
          },
        }
      )
      .then((res) => {
       
        setData(res.data);
        setLoading(false);
      });
  }

  function addMessage() {
   
    axios
      .post(
        "http://localhost:8000/api/v1/messages",
        {
          receiver_id: otherId,
          message: message,
        },
        {
          headers: {
            Authorization: `Bearer ${userData?.token}`,
          },
        }
      )
      .then((res) => {
        setMessage("")
      });
  }
function handleSubmit(e){
  e.preventDefault()
  axios.post("http://localhost:8000/api/v1/login", { email, password })
  .then((res) => {
 
    setUserData(res.data)
    setIsAuth(true)
  });

}
useEffect(()=>{
 if(userData){
  getList();
 }
}, [userData])
  return (
    <>
      {isAuth ? (
        <section className=" bg-gray-200 h-screen w-screen p-10 flex justify-center items-center">
        
          <div className=" w-[80vw] h-[600px] grid grid-cols-3 gap-4">
            <div className="col-span-1 bg-white rounded-lg">
            <h1 className="font-bold text-base text-center py-3 border-b">Welcome {userData?.user.firstName} {userData?.user.lastName}</h1>
              <ul>
                {list.map((item, index) => (
                  <li
                    className="mb-2 px-4 py-2 border-b"
                    key={index}
                    onClick={() => {
                      getMessage(item.user_id);
                      setName(`${item.user.firstName} ${item.user.lastName}`);
                    }}
                  >
                    <p>
                      {item.user.firstName} {item.user.lastName}
                    </p>
                    <div className="text-xs text-gray-400 flex items-center justify-between">
                      {" "}
                      <p className="flex-1 max-w-[140px] truncate">
                        {item.message}{" "}
                      </p>{" "}
                      <span>{moment(item.created_at).fromNow()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-lg  flex flex-col col-span-2">
              <div className="px-4 py-4 bg-gray-400"> {name}</div>
              <div className="relative flex-1 p-4 max-h-[500px] overflow-y-auto">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-300 italic">
                      Loading messages
                    </span>
                  </div>
                ) : (
                  <ul>
                    {data.map((item) => (
                      <li
                        key={item.id}
                        className={`${
                          userData.user.id == item.user_id
                            ? "text-right ml-auto"
                            : "text-left mr-auto"
                        } bg-gray-50 rounded-[20px] px-4 py-2 mb-2 max-w-max`}
                      >
                        <p className="text-xs mb-1">{item.user?.firstName}</p>
                        <p> {item.message}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="relative flex items-center">
                <input
                  value={message}
                  className="w-full px-4 py-4 rounded-lg bg-gray-100"
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button
                  onClick={() => addMessage()}
                  className="px-2 py-2 right-2 absolute z-10 text-gray-700 bg-blue-300 rounded-lg text-sm"
                >
                  Send message
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className=" bg-gray-200 h-screen w-screen p-10 flex justify-center items-center">
          <div>
            <h4 className="text-center mb-5 text-2xl">Login to Chat</h4>
            <form onSubmit={handleSubmit} className="w-[400px]">
              <div className="mb-5  w-full">
                <input className="border px-4 py-3 rounded-lg  w-full" value={email} onChange={(e)=> setEmail(e.target.value)} />
              </div>
              <div className="mb-5  w-full">
                <input
                  text="password"
                  className="border px-4 py-3 rounded-lg w-full"
                  value={password}
                  onChange={(e)=> setPassword(e.target.value)}
                />
              </div>
              <div>
            <button type="submit" className=" text-center text-white w-full bg-blue-600 px-4 py-3 rounded-lg">Login</button>
                </div>
            </form>
          </div>
        </section>
      )}
    </>
  );
}
