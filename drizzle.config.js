
export default {
    dialect:"postgresql",
    schema:'./utils/db/schema.ts',
    out:'./drizzle',

    dbCredentials:{
        url:"postgresql://neondb_owner:npg_rjoXB07tWzHG@ep-snowy-glade-a5e6wv74-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require",
        connectionString:"postgresql://neondb_owner:npg_rjoXB07tWzHG@ep-snowy-glade-a5e6wv74-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
    }
}