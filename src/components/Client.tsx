import Avatar from "react-avatar";

interface Props {
  key?: number;
  username: string;
}

export default function Client({ username }: Props) {
  return (
    <div className="client">
      <Avatar name={username} size="50" round="14px" />
      <span className="userName">{username}</span>
    </div>
  );
}
