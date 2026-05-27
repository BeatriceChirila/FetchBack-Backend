app.get('/api/clinics', async (req, res) => {
    try {
        const clinics = await prisma.clinic.findMany();
        res.json(clinics);
    } catch (error) {
        res.status(500).json({ error: "Could not fetch clinics" });
    }
});