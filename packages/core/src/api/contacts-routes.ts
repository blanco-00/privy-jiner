import { Router, Request, Response } from 'express';
import { ContactsService } from '../modules/contacts/index.js';

export function createContactsRouter(contactsService: ContactsService): Router {
  const router = Router();

  router.get('/contacts', async (req: Request, res: Response) => {
    try {
      const { search, group_id } = req.query;
      const contacts = contactsService.getContacts(search as string, group_id as string);
      res.json(contacts);
    } catch (error) {
      console.error('Get contacts error:', error);
      res.status(500).json({ error: 'Failed to get contacts' });
    }
  });

  router.get('/contacts/:id', async (req: Request, res: Response) => {
    try {
      const contact = contactsService.getContact(req.params.id);
      if (!contact) {
        res.status(404).json({ error: 'Contact not found' });
        return;
      }
      res.json(contact);
    } catch (error) {
      console.error('Get contact error:', error);
      res.status(500).json({ error: 'Failed to get contact' });
    }
  });

  router.post('/contacts', async (req: Request, res: Response) => {
    try {
      const { name, phone, email, birthday, address, company, title, group_id, avatar, notes } = req.body;
      if (!name) {
        res.status(400).json({ error: 'name is required' });
        return;
      }
      const contact = contactsService.createContact({ name, phone, email, birthday, address, company, title, group_id, avatar, notes });
      res.json(contact);
    } catch (error) {
      console.error('Create contact error:', error);
      res.status(500).json({ error: 'Failed to create contact' });
    }
  });

  router.put('/contacts/:id', async (req: Request, res: Response) => {
    try {
      const { name, phone, email, birthday, address, company, title, group_id, avatar, notes, is_favorite } = req.body;
      const contact = contactsService.updateContact(req.params.id, { name, phone, email, birthday, address, company, title, group_id, avatar, notes, is_favorite });
      if (!contact) {
        res.status(404).json({ error: 'Contact not found' });
        return;
      }
      res.json(contact);
    } catch (error) {
      console.error('Update contact error:', error);
      res.status(500).json({ error: 'Failed to update contact' });
    }
  });

  router.delete('/contacts/:id', async (req: Request, res: Response) => {
    try {
      const success = contactsService.deleteContact(req.params.id);
      res.json({ success });
    } catch (error) {
      console.error('Delete contact error:', error);
      res.status(500).json({ error: 'Failed to delete contact' });
    }
  });

  router.get('/contacts/birthdays/upcoming', async (req: Request, res: Response) => {
    try {
      const { days } = req.query;
      const contacts = contactsService.getUpcomingBirthdays(days ? parseInt(days as string) : 30);
      res.json(contacts);
    } catch (error) {
      console.error('Get upcoming birthdays error:', error);
      res.status(500).json({ error: 'Failed to get upcoming birthdays' });
    }
  });

  router.get('/contacts/favorites', async (_req: Request, res: Response) => {
    try {
      const contacts = contactsService.getFavorites();
      res.json(contacts);
    } catch (error) {
      console.error('Get favorites error:', error);
      res.status(500).json({ error: 'Failed to get favorites' });
    }
  });

  router.get('/groups', async (_req: Request, res: Response) => {
    try {
      const groups = contactsService.getGroups();
      res.json(groups);
    } catch (error) {
      console.error('Get groups error:', error);
      res.status(500).json({ error: 'Failed to get groups' });
    }
  });

  router.post('/groups', async (req: Request, res: Response) => {
    try {
      const { name, color } = req.body;
      if (!name) {
        res.status(400).json({ error: 'name is required' });
        return;
      }
      const group = contactsService.createGroup({ name, color });
      res.json(group);
    } catch (error) {
      console.error('Create group error:', error);
      res.status(500).json({ error: 'Failed to create group' });
    }
  });

  router.delete('/groups/:id', async (req: Request, res: Response) => {
    try {
      const success = contactsService.deleteGroup(req.params.id);
      res.json({ success });
    } catch (error) {
      console.error('Delete group error:', error);
      res.status(500).json({ error: 'Failed to delete group' });
    }
  });

  return router;
}
