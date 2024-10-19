module.exports.main = async (event) => {
  const data = JSON.parse(event.body);

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: `Hello, ${ data ? data.name : 'World' }!`,
        input: event,
      },
      null,
      2,
    ),
  }
}
