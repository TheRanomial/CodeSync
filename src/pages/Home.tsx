import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

function Home() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("ROOM ID & username is required");
      return;
    }

    navigate(`/editor/${roomId}`, {
      state: {
        username,
      },
    });
  };

  const createNewRoom = (e: FormEvent) => {
    e.preventDefault();

    const id = uuidv4();
    setRoomId(id);
    toast.success("New Room ceated");
  };

  return (
    <div className="homePageWrapper">
      <div className="formWrapper">
        <img src="./code-sync.png" alt="code-sync-logo" className="mb-7" />
        <div className="inputGroup">
          <input
            type="text"
            className="inputBox text-slate-800"
            placeholder="ROOM ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <input
            type="text"
            className="inputBox text-slate-800"
            placeholder="USERNAME"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <div className="flex mt-6 items-center justify-between">
            <button className="btn joinBtn" onClick={joinRoom}>
              Join
            </button>
          </div>
          <span className="createInfo mt-6" >
            If you don't have an invite then create &nbsp;
            <button className="createNewBtn" onClick={createNewRoom}>
              new room
            </button>
          </span>
        </div>
      </div>
      <footer>
        <h4>
          Built by &nbsp;
          <Link to="https://github.com/TheRanomial">Himanshu</Link>
        </h4>
      </footer>
    </div>
  );
}

export default Home;
