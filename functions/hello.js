module.exports.main = async (event) => {
  const data = JSON.parse(event.body);

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: `Hello, ${ data.name }!`,
        input: event,
      },
      null,
      2,
    ),
  }
}
