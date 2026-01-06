const axios = require('axios');

class CloudflareAPI {
    constructor() {
        this.email = null;
        this.apiKey = null;
        this.client = null;
    }

    init(email, apiKey) {
        this.email = email;
        this.apiKey = apiKey;
        this.client = axios.create({
            baseURL: 'https://api.cloudflare.com/client/v4',
            headers: {
                'X-Auth-Email': email,
                'X-Auth-Key': apiKey,
                'Content-Type': 'application/json'
            }
        });
    }

    async verifyToken() {
        try {
            const userRes = await this.client.get('/user');
            return { success: true, data: userRes.data.result };
        } catch (error) {
            console.error('Auth Error:', error?.response?.data || error.message);
            throw new Error('Authentication failed. Check credentials.');
        }
    }

    async getAccounts() {
        const res = await this.client.get('/accounts');
        return res.data.result;
    }

    // --- Zones ---
    async getZones() {
        const res = await this.client.get('/zones?per_page=50');
        return res.data.result;
    }

    async getZoneDetails(zoneId) {
        const res = await this.client.get(`/zones/${zoneId}`);
        return res.data.result;
    }

    // --- DNS ---
    async getDNSRecords(zoneId) {
        const res = await this.client.get(`/zones/${zoneId}/dns_records?per_page=100`);
        return res.data.result;
    }

    async createDNSRecord(zoneId, record) {
        const res = await this.client.post(`/zones/${zoneId}/dns_records`, record);
        return res.data.result;
    }

    async updateDNSRecord(zoneId, recordId, record) {
        const res = await this.client.put(`/zones/${zoneId}/dns_records/${recordId}`, record);
        return res.data.result;
    }

    async deleteDNSRecord(zoneId, recordId) {
        const res = await this.client.delete(`/zones/${zoneId}/dns_records/${recordId}`);
        return res.data.result;
    }

    // --- Security ---
    async updateSecurityLevel(zoneId, level) {
        // level: off, essentially_off, low, medium, high, under_attack
        const res = await this.client.patch(`/zones/${zoneId}/settings/security_level`, { value: level });
        return res.data.result;
    }

    // --- Cache ---
    async purgeCache(zoneId, purgeEverything = true, files = []) {
        const payload = purgeEverything ? { purge_everything: true } : { files };
        const res = await this.client.post(`/zones/${zoneId}/purge_cache`, payload);
        return res.data.result;
    }

    // --- Workers ---
    async getWorkersScripts(accountId) {
        const res = await this.client.get(`/accounts/${accountId}/workers/scripts`);
        return res.data.result;
    }

    async uploadWorkerScript(accountId, name, scriptContent, metadata = {}) {
        // This often requires multipart form data if binding metadata
        const res = await this.client.put(`/accounts/${accountId}/workers/scripts/${name}`, scriptContent, {
            headers: { 'Content-Type': 'application/javascript' }
        });
        return res.data.result;
    }

    // --- Pages ---
    async getPagesProjects(accountId) {
        const res = await this.client.get(`/accounts/${accountId}/pages/projects`);
        return res.data.result;
    }
}

module.exports = new CloudflareAPI();
