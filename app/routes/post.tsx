import type { Route } from "./+types/post";

export async function loader({ params }: Route.LoaderArgs) {
  const postId = params.postId;
  return { postId };
}

export async function action() {}

export default function Post({ loaderData }: Route.ComponentProps) {
  const { postId } = loaderData!;
  return (
    <div>
      <p>Post Id: {postId}</p>
    </div>
  );
}
