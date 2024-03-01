import app from './server';
import "dotenv/config";

const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`listening on port ${PORT}`));
}
