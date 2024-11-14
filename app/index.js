const express = require('express')
const app = express()
const path = require('path')
const pg = require('pg')
const port = process.env.PORT || 3000
const { Client } = pg

const client = new Client({
  connectionString: process.env.DATABASE_URL
})
client.connect().then(() => {
  console.log("Connected to postgres db");
}).catch(err => {
  console.error("Error connecting to postgres db")
})

app.use(express.json())

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/questions', async function(req, res) {
  try {
    const result = await client.query(`
      Select
        (SELECT count(true) FROM public.answers WHERE is_correct IS TRUE) as score,
        (SELECT count(true) FROM public.answers) as answers_total,
        (
          SELECT
            questions.uuid
          FROM questions
          WHERE
            questions.uuid NOT IN (
              SELECT question_uuid FROM answers
            )
          LIMIT 1
        ) as question_index,
        (SELECT COALESCE(array_to_json(array_agg(row_to_json(array_row))), '[]'::json) FROM (
          Select
            questions.uuid,
            questions.question,
            questions.option_a,
            questions.option_b,
            questions.option_c,
            questions.option_d
          FROM questions
        ) array_row)
         as questions;
      `)
    res.json(result.rows[0]);
  } catch(err) {
    console.log(err);
    res.status(500).send('Failed to retrieve');
  }
});

app.put('/reset', async function(req, res) {
  try {
    await client.query(`
      TRUNCATE answers;
    `);
    const data = await client.query(`
      Select
      (SELECT count(true) FROM public.answers WHERE is_correct IS TRUE) as score,
        (SELECT count(true) FROM public.answers) as answers_total,
        (
          Select questions.uuid FROM questions WHERE
            questions.uuid NOT IN (
              Select question_uuid FROM answers
            )
          LIMIT 1
        ) as question_index`)
    res.json(data.rows[0])
  } catch(err) {
    console.log(err);
    res.status(500).send('Failed to reset');
  }
});

app.put('/submit', async function(req, res) {
  const {question_uuid, choice} = req.body;
  const data = await client.query(`
    Select correct_answer FROM public.questions WHERE uuid = $1`, [question_uuid])
  const is_correct  = (data.rows[0]["correct_answer"] === choice)
  try {
    await client.query(`
      INSERT INTO public.answers (question_uuid, choice, is_correct) VALUES ($1, $2, $3)
      `, [question_uuid, choice, is_correct])
    const data = await client.query(`
      Select
      (SELECT count(true) FROM public.answers WHERE is_correct IS TRUE) as score,
        (SELECT count(true) FROM public.answers) as answers_total,
        (
          Select questions.uuid FROM questions WHERE
            questions.uuid NOT IN (
              Select question_uuid FROM answers
            )
          LIMIT 1
        ) as question_index`)
    res.json(data.rows[0])
  } catch(err) {
    console.log(err);
    res.status(500).send('Failed to update');
  }
  console.log("send", req.body);
});

app.get('/style.css', function(req, res) {
  res.sendFile(path.join(__dirname + '/style.css'));
});

app.get('/app.js', function(req, res) {
  res.sendFile(path.join(__dirname + '/app.js'));
});

console.log(`PLANNING TO USE PORT: ${port}`)
app.listen(port, '0.0.0.0', () => console.log(`Listening on port ${port}!`))