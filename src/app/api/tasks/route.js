import clientPromise from "@/lib/mongodb";

export async function GET(req) {

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const date = searchParams.get("date");

  const client = await clientPromise;
  const db = client.db("timewheel");

  const data = await db.collection("tasks").findOne({
    userEmail: email,
    date: date
  });

  return Response.json(data || { tasks: [] });
}


export async function POST(req) {

  const body = await req.json();

  const client = await clientPromise;
  const db = client.db("timewheel");

  await db.collection("tasks").updateOne(
    {
      userEmail: body.email,
      date: body.date
    },
    {
      $set: {
        tasks: body.tasks
      }
    },
    { upsert: true }
  );

  return Response.json({ success: true });

}