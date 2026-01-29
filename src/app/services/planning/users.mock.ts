import { UsersApiResponse } from "../../interfaces/userItem";

export const MOCK_USERS_RESPONSE: UsersApiResponse = {
  items: [
    {
      id: 4,
      code: "NCPY46",
      first_name: "SmokeAdmin",
      last_name: "cisse",
      is_active: true,
      email: "alyhabcis@gmail.com",
      phone_number: "0707070707"
    },
    {
      id: 5,
      code: "string",
      first_name: "string",
      last_name: "string",
      is_active: false,
      email: "user@example.com",
      phone_number: "stringstri"
    },
    {
      id: 6,
      code: "012345",
      first_name: "Aly1",
      last_name: "CISSE",
      is_active: false,
      email: "alyhabcis@example.com",
      phone_number: "0707070707"
    },
    {
      id: 7,
      code: "012346",
      first_name: "Aly2",
      last_name: "CISSE2",
      is_active: false,
      email: "alyhabcis2@example.com",
      phone_number: "0707070202"
    },
    {
      id: 8,
      code: "codetest",
      first_name: "test",
      last_name: "test",
      is_active: true,
      email: "usertest@example.com",
      phone_number: "0724154786"
    },
    {
      id: 9,
      code: "stringlllll",
      first_name: "string",
      last_name: "string",
      is_active: false,
      email: "userll@example.com",
      phone_number: "stringstri"
    },
    {
      id: 10,
      code: "ncpy5",
      first_name: "Ahmed",
      last_name: "DIKOUK",
      is_active: true,
      email: "ah.dikouk@gmail.com",
      phone_number: "0753967004"
    },
    {
      id: 11,
      code: "NJE132",
      first_name: "Emilie",
      last_name: "Tossan",
      is_active: true,
      email: "ue8far@vde-formation.com",
      phone_number: "0769341622"
    },
    {
      id: 12,
      code: "NJE158",
      first_name: "K",
      last_name: "M",
      is_active: true,
      email: "a@a.com",
      phone_number: "0123456789"
    },
    {
      id: 14,
      code: "NJE159",
      first_name: "Ken",
      last_name: "Net",
      is_active: false,
      email: "ken@net.fr",
      phone_number: "0123456789"
    }
  ],
  total: 10,
  page: 0,
  limit: 10,
  pages: 1,
  links: {
    first: "https://prez-cool-staging.appsolutions224.com/api/v1/users?page=0&limit=10"
  }
};